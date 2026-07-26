const baseStyles = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background-color: #0F0F1A;
  color: #e2e8f0;
`;

const headerStyles = `
  background: linear-gradient(135deg, #6C5CE7, #00CEC9);
  padding: 30px;
  text-align: center;
  border-radius: 12px 12px 0 0;
`;

const contentStyles = `
  padding: 30px;
  background-color: #1A1A2E;
`;

const buttonStyles = `
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #6C5CE7, #00CEC9);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
`;

const footerStyles = `
  padding: 20px 30px;
  text-align: center;
  color: #64748b;
  font-size: 12px;
  background-color: #16213E;
  border-radius: 0 0 12px 12px;
`;

export const welcomeEmailTemplate = (name) => `
<div style="${baseStyles}">
  <div style="${headerStyles}">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Mishkwat! 🎉</h1>
  </div>
  <div style="${contentStyles}">
    <h2 style="color: #fff; margin-top: 0;">Hey ${name},</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
      Thank you for joining Mishkwat! We're thrilled to have you as part of our community.
      Explore our curated collection of premium products and enjoy an unmatched shopping experience.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}" style="${buttonStyles}">Start Shopping</a>
    </div>
    <p style="color: #94a3b8; font-size: 14px;">
      If you have any questions, feel free to reach out to our support team.
    </p>
  </div>
  <div style="${footerStyles}">
    <p>&copy; ${new Date().getFullYear()} Mishkwat. All rights reserved.</p>
  </div>
</div>
`;

export const orderConfirmationTemplate = (order) => `
<div style="${baseStyles}">
  <div style="${headerStyles}">
    <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! ✅</h1>
  </div>
  <div style="${contentStyles}">
    <h2 style="color: #fff; margin-top: 0;">Thank you for your order!</h2>
    <div style="background: #16213E; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid rgba(108,92,231,0.3);">
      <p style="margin: 5px 0; color: #cbd5e1;"><strong style="color: #6C5CE7;">Order Number:</strong> ${order.orderNumber}</p>
      <p style="margin: 5px 0; color: #cbd5e1;"><strong style="color: #6C5CE7;">Total Amount:</strong> ₹${order.totalAmount.toLocaleString('en-IN')}</p>
      <p style="margin: 5px 0; color: #cbd5e1;"><strong style="color: #6C5CE7;">Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
      <p style="margin: 5px 0; color: #cbd5e1;"><strong style="color: #6C5CE7;">Items:</strong> ${order.items.length} product(s)</p>
    </div>
    <h3 style="color: #fff;">Order Items:</h3>
    ${order.items.map(item => `
      <div style="display: flex; padding: 10px 0; border-bottom: 1px solid #2d3748;">
        <div>
          <p style="margin: 2px 0; color: #e2e8f0; font-weight: 600;">${item.title}</p>
          <p style="margin: 2px 0; color: #94a3b8;">Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')}</p>
        </div>
      </div>
    `).join('')}
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/orders" style="${buttonStyles}">Track Order</a>
    </div>
  </div>
  <div style="${footerStyles}">
    <p>&copy; ${new Date().getFullYear()} Mishkwat. All rights reserved.</p>
  </div>
</div>
`;

export const shippingUpdateTemplate = (order, status) => {
  const statusMessages = {
    processing: 'Your order is being processed 📦',
    packed: 'Your order has been packed 📦',
    shipped: 'Your order has been shipped! 🚚',
    outForDelivery: 'Your order is out for delivery! 🏃',
    delivered: 'Your order has been delivered! 🎉',
  };
  return `
<div style="${baseStyles}">
  <div style="${headerStyles}">
    <h1 style="color: white; margin: 0; font-size: 28px;">Shipping Update 🚚</h1>
  </div>
  <div style="${contentStyles}">
    <h2 style="color: #fff; margin-top: 0;">${statusMessages[status] || 'Order Update'}</h2>
    <div style="background: #16213E; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid rgba(108,92,231,0.3);">
      <p style="margin: 5px 0; color: #cbd5e1;"><strong style="color: #6C5CE7;">Order:</strong> ${order.orderNumber}</p>
      <p style="margin: 5px 0; color: #cbd5e1;"><strong style="color: #6C5CE7;">Status:</strong> ${status.replace(/([A-Z])/g, ' $1').toUpperCase()}</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="${buttonStyles}">View Order</a>
    </div>
  </div>
  <div style="${footerStyles}">
    <p>&copy; ${new Date().getFullYear()} Mishkwat. All rights reserved.</p>
  </div>
</div>
`;
};

export const passwordResetTemplate = (resetUrl) => `
<div style="${baseStyles}">
  <div style="${headerStyles}">
    <h1 style="color: white; margin: 0; font-size: 28px;">Reset Password 🔐</h1>
  </div>
  <div style="${contentStyles}">
    <h2 style="color: #fff; margin-top: 0;">Password Reset Request</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
      You requested a password reset. Click the button below to set a new password.
      This link expires in 30 minutes.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="${buttonStyles}">Reset Password</a>
    </div>
    <p style="color: #94a3b8; font-size: 14px;">
      If you didn't request this, please ignore this email. Your password will remain unchanged.
    </p>
  </div>
  <div style="${footerStyles}">
    <p>&copy; ${new Date().getFullYear()} Mishkwat. All rights reserved.</p>
  </div>
</div>
`;

export const newsletterWelcomeTemplate = (email) => `
<div style="${baseStyles}">
  <div style="${headerStyles}">
    <h1 style="color: white; margin: 0; font-size: 28px;">You're In! 🎉</h1>
  </div>
  <div style="${contentStyles}">
    <h2 style="color: #fff; margin-top: 0;">Welcome to the Mishkwat Newsletter!</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
      Thanks for subscribing with <strong>${email}</strong>. You'll be the first to know about
      exclusive deals, new arrivals, and special offers.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}" style="${buttonStyles}">Shop Now</a>
    </div>
  </div>
  <div style="${footerStyles}">
    <p>&copy; ${new Date().getFullYear()} Mishkwat. All rights reserved.</p>
  </div>
</div>
`;
