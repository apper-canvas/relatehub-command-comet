import apper from 'https://cdn.apper.io/actions/apper-actions.js';
import OpenAI from 'npm:openai';

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
          message: 'OpenAI API key not configured. Please add OPENAI_API_KEY to secrets.' 
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Generate stage-specific prompt
    const prompt = generatePromptForStage(stage, dealTitle, dealValue, contactName);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional sales communication expert. Generate clear, professional, and persuasive email templates for CRM deal stages. Keep emails concise, action-oriented, and appropriate for the stage.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // Extract generated email content
    const generatedEmail = completion.choices[0]?.message?.content;

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

    // Return successful response with generated email
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
    // Handle OpenAI API errors
    if (error.status === 401) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY secret.' 
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (error.status === 429) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'OpenAI API rate limit exceeded. Please try again later.' 
        }), 
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generic error handling
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'An error occurred while generating the email template' 
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

  return stagePrompts[stage] || `Generate a professional email template for the "${stage}" stage of deal "${dealTitle}"${valueText}${contactText}.`;
}