import apper from 'https://cdn.apper.io/actions/apper-actions.js';

apper.serve(async (req) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed. Use POST.'
      }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Parse request body
    const body = await req.json();
    const { dealTitle, stage, dealValue, contactName } = body;

    // Validate required fields
    if (!dealTitle || !stage) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required fields: dealTitle and stage are required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Retrieve OpenAI API key from secrets
    const apiKey = await apper.getSecret('OPENAI_API_KEY');

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'OpenAI API key not configured. Please add OPENAI_API_KEY to secrets.'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate stage-specific prompt
    const prompt = generatePromptForStage(stage, dealTitle, dealValue, contactName);

    // Call OpenAI REST API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional sales communication expert. Generate clear, professional, and persuasive email templates for CRM deal stages. Keep emails concise, action-oriented, and appropriate for the stage.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    // Handle non-OK API responses
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          success: false,
          message:
            errData.error?.message ||
            `OpenAI API error (status ${response.status})`
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract response data
    const data = await response.json();
    const generatedEmail = data.choices?.[0]?.message?.content;

    if (!generatedEmail) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to generate email content from OpenAI'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        emailTemplate: generatedEmail,
        stage: stage
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    // Generic error handling
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to generate stage-specific prompts
function generatePromptForStage(stage, dealTitle, dealValue, contactName) {
  const valueText = dealValue ? ` worth $${dealValue}` : '';
  const contactText = contactName ? ` for ${contactName}` : '';

  const stagePrompts = {
    'Lead': `Generate a professional introduction email for a new lead${contactText}. The deal is titled "${dealTitle}"${valueText}. The email should:
- Introduce yourself and your company
- Express interest in understanding their needs
- Suggest a brief discovery call
- Be friendly and non-pushy
- Include a clear call-to-action`,

    'Qualified': `Generate a follow-up email for a qualified lead${contactText}. The deal "${dealTitle}"${valueText} has been qualified. The email should:
- Reference previous conversation or interaction
- Provide more detailed information about solutions
- Address potential pain points
- Propose next steps or a demo
- Maintain enthusiasm and professionalism`,

    'Proposal': `Generate a proposal submission email${contactText} for the deal "${dealTitle}"${valueText}. The email should:
- Formally introduce the attached proposal
- Highlight key benefits and value propositions
- Summarize the solution briefly
- Set expectations for review timeline
- Offer to address questions or concerns`,

    'Negotiation': `Generate a negotiation discussion email${contactText} for the deal "${dealTitle}"${valueText}. The email should:
- Acknowledge we're in the negotiation phase
- Show flexibility and willingness to find mutual value
- Address any concerns raised previously
- Propose a meeting to discuss terms
- Maintain positive and collaborative tone`,

    'Closed Won': `Generate a congratulatory onboarding email${contactText} for the successfully closed deal "${dealTitle}"${valueText}. The email should:
- Express gratitude for choosing us
- Outline immediate next steps
- Introduce the onboarding process
- Provide key contact information
- Set positive expectations for the partnership`,

    'Closed Lost': `Generate a professional follow-up email${contactText} for the deal "${dealTitle}"${valueText} that didn't close. The email should:
- Thank them for their time and consideration
- Express hope to work together in the future
- Offer to stay in touch
- Leave the door open professionally
- Maintain goodwill and positive relationship`
  };

  return (
    stagePrompts[stage] ||
    `Generate a professional email template for the "${stage}" stage of deal "${dealTitle}"${valueText}${contactText}.`
  );
}
