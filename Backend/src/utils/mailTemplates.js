import { getMailGenerator, sendEmail } from '../config/mailer.js';

export const sendWelcomeEmail = async (user) => {
  const mailGenerator = getMailGenerator();
  
  const email = {
    body: {
      name: user.name,
      intro: `Welcome to Homexa! We're thrilled to have you join our community of travelers and hosts.`,
      action: {
        instructions: 'Start exploring amazing stays around the world:',
        button: {
          color: '#FF385C',
          text: 'Explore Properties',
          link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/properties`
        }
      },
      outro: [
        'Need help? Just reply to this email or visit our Help Center.',
        'Happy travels!',
        'The Homexa Team'
      ]
    }
  };

  const emailBody = mailGenerator.generate(email);
  const emailText = mailGenerator.generatePlaintext(email);

  await sendEmail({
    to: user.email,
    subject: `Welcome to Homexa, ${user.name}! 🏡`,
    html: emailBody,
    text: emailText
  });
};

export const sendBookingConfirmation = async (booking, guest, property) => {
  const mailGenerator = getMailGenerator();
  const checkIn = new Date(booking.checkIn).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const checkOut = new Date(booking.checkOut).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const email = {
    body: {
      name: guest.name,
      intro: `Your booking at ${property.title} has been confirmed! 🎉`,
      table: {
        data: [
          { item: 'Property', description: property.title },
          { item: 'Location', description: `${property.location.city}, ${property.location.state}` },
          { item: 'Check-in', description: checkIn },
          { item: 'Check-out', description: checkOut },
          { item: 'Guests', description: `${booking.totalGuests} guests` },
          { item: 'Total Paid', description: `₹${booking.pricing.totalAmount.toLocaleString('en-IN')}` }
        ]
      },
      action: {
        instructions: 'View your booking details:',
        button: {
          color: '#FF385C',
          text: 'View Booking',
          link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/bookings/${booking._id}`
        }
      },
      outro: 'We hope you have a wonderful stay! Don\'t forget to check house rules and contact your host if needed.'
    }
  };

  const emailBody = mailGenerator.generate(email);
  const emailText = mailGenerator.generatePlaintext(email);

  await sendEmail({
    to: guest.email,
    subject: `Booking Confirmed: ${property.title} - ${checkIn}`,
    html: emailBody,
    text: emailText
  });
};

export const sendHostBookingNotification = async (booking, host, property, guest) => {
  const mailGenerator = getMailGenerator();
  const checkIn = new Date(booking.checkIn).toLocaleDateString('en-IN');

  const email = {
    body: {
      name: host.name,
      intro: `You have a new booking for ${property.title}!`,
      table: {
        data: [
          { item: 'Guest', description: guest.name },
          { item: 'Check-in', description: checkIn },
          { item: 'Nights', description: `${booking.pricing.nights}` },
          { item: 'Total Earnings', description: `₹${booking.pricing.subtotal.toLocaleString('en-IN')}` }
        ]
      },
      action: {
        button: {
          color: '#22c55e',
          text: 'View Booking',
          link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/host/bookings`
        }
      },
      outro: 'Please prepare for your guest\'s arrival!'
    }
  };

  const emailBody = mailGenerator.generate(email);
  const emailText = mailGenerator.generatePlaintext(email);

  await sendEmail({
    to: host.email,
    subject: `New Booking: ${property.title} for ${checkIn}`,
    html: emailBody,
    text: emailText
  });
};
