import apper from 'https://cdn.apper.io/actions/apper-actions.js';
import { Resend } from 'npm:resend';

apper.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Only POST requests are accepted.' 
      }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { purchaseOrderId, status, supplierEmail, supplierName, orderDate, expectedDeliveryDate } = body;

  if (!purchaseOrderId || !status || !supplierEmail || !supplierName) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: purchaseOrderId, status, supplierEmail, or supplierName' 
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(supplierEmail)) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid email address format' 
      }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const validStatuses = ['draft', 'submitted', 'approved', 'partially_received', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let resendApiKey;
  try {
    resendApiKey = await apper.getSecret('RESEND_API_KEY');
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Email service configuration error. Please contact system administrator.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!resendApiKey) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Email service not configured. Missing API key.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const resend = new Resend(resendApiKey);

  const statusLabels = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    partially_received: 'Partially Received',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  const statusColors = {
    draft: '#6B7280',
    submitted: '#3B82F6',
    approved: '#10B981',
    partially_received: '#F59E0B',
    completed: '#059669',
    cancelled: '#EF4444'
  };

  const formattedOrderDate = orderDate ? new Date(orderDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'N/A';

  const formattedDeliveryDate = expectedDeliveryDate ? new Date(expectedDeliveryDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'N/A';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Purchase Order Status Update</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="background-color: #2563eb; padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">StockKeep</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 14px;">Inventory Management System</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                Purchase Order Status Update
              </h2>
              
              <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 15px; line-height: 1.5;">
                Dear ${supplierName},
              </p>
              
              <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 15px; line-height: 1.6;">
                The status of your purchase order <strong>#${purchaseOrderId}</strong> has been updated.
              </p>
              
              <div style="background-color: #f9fafb; border-left: 4px solid ${statusColors[status]}; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <div style="margin-bottom: 15px;">
                  <span style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">New Status</span>
                  <div style="margin-top: 8px;">
                    <span style="display: inline-block; padding: 6px 12px; background-color: ${statusColors[status]}; color: #ffffff; border-radius: 4px; font-size: 14px; font-weight: 600;">
                      ${statusLabels[status]}
                    </span>
                  </div>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 15px;">
                  <div style="margin-bottom: 10px;">
                    <span style="color: #6b7280; font-size: 13px;">Order Date:</span>
                    <span style="color: #1f2937; font-size: 14px; font-weight: 500; margin-left: 8px;">${formattedOrderDate}</span>
                  </div>
                  <div>
                    <span style="color: #6b7280; font-size: 13px;">Expected Delivery:</span>
                    <span style="color: #1f2937; font-size: 14px; font-weight: 500; margin-left: 8px;">${formattedDeliveryDate}</span>
                  </div>
                </div>
              </div>
              
              <p style="color: #6b7280; margin: 0; font-size: 13px; line-height: 1.5;">
                If you have any questions regarding this purchase order, please contact our procurement team.
              </p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 12px;">
                This is an automated notification from StockKeep Inventory Management System
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: 'StockKeep <notifications@stockkeep.com>',
      to: [supplierEmail],
      subject: `Purchase Order #${purchaseOrderId} Status Update - ${statusLabels[status]}`,
      html: htmlContent
    });

    if (!result || result.error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result?.error?.message || 'Failed to send email notification' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification sent successfully',
        emailId: result.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email due to unexpected error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});