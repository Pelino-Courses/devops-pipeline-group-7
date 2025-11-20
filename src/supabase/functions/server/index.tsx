import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { initializeSeedData } from "./seed.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Initialize seed data
initializeSeedData();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify user authentication
async function verifyAuth(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user;
  } catch (error) {
    console.log('Auth verification error:', error);
    return null;
  }
}

// Health check endpoint
app.get("/make-server-af101b5e/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH ENDPOINTS ====================

// User signup
app.post("/make-server-af101b5e/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, role, phone, location, lmp } = body;

    // Check if user already exists in KV
    const existingUserId = await kv.get(`user:email:${email}`);
    if (existingUserId) {
      return c.json({ error: 'A user with this email address has already been registered' }, 400);
    }

    // Try to delete any existing unconfirmed user in Supabase Auth first
    try {
      const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingAuthUsers?.users?.find(u => u.email === email);
      if (existingUser && !existingUser.email_confirmed_at) {
        console.log('Deleting unconfirmed user:', email);
        await supabase.auth.admin.deleteUser(existingUser.id);
      }
    } catch (cleanupError) {
      console.log('Cleanup error (non-fatal):', cleanupError);
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server is not configured
      user_metadata: {
        name,
        role,
        phone,
        location,
      },
    });

    if (authError) {
      console.log('Signup auth error:', authError);
      
      // Handle specific error cases
      if (authError.message.includes('already been registered')) {
        return c.json({ error: 'A user with this email address has already been registered. Please try logging in or use a different email.' }, 400);
      }
      
      return c.json({ error: authError.message }, 400);
    }

    const userId = authData.user.id;

    // Calculate due date if LMP provided
    let dueDate = null;
    if (role === 'mother' && lmp) {
      const lmpDate = new Date(lmp);
      lmpDate.setDate(lmpDate.getDate() + 280); // 40 weeks
      dueDate = lmpDate.toISOString().split('T')[0];
    }

    // Store user profile in KV
    const userProfile = {
      id: userId,
      email,
      name,
      role,
      phone,
      location,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, userProfile);
    await kv.set(`user:email:${email}`, userId);

    // Store role-specific data
    if (role === 'mother') {
      const motherData = {
        userId,
        lmp: lmp || null,
        dueDate,
        pregnancyStage: lmp ? calculatePregnancyWeeks(lmp) : '0 weeks',
        hasBaby: false,
        babyBirthDate: null,
        measurements: [],
      };
      await kv.set(`mother:${userId}`, motherData);
    } else if (role === 'clinic') {
      const clinicData = {
        userId,
        approved: false,
        approvedAt: null,
        approvedBy: null,
      };
      await kv.set(`clinic:${userId}`, clinicData);
      
      // Add to pending clinics list
      const pendingClinics = await kv.get('system:pending-clinics') || [];
      pendingClinics.push(userId);
      await kv.set('system:pending-clinics', pendingClinics);
    }

    return c.json({
      user: {
        ...userProfile,
        ...(role === 'mother' ? { lmp, dueDate, pregnancyStage: calculatePregnancyWeeks(lmp) } : {}),
      },
      message: 'Account created successfully',
    });
  } catch (error: any) {
    console.log('Signup error:', error);
    return c.json({ error: error.message || 'Signup failed' }, 500);
  }
});

// User login
app.post("/make-server-af101b5e/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    // Get user profile
    const userId = await kv.get(`user:email:${email}`);
    if (!userId) {
      return c.json({ error: 'User not found' }, 404);
    }

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Check if clinic is approved
    if (userProfile.role === 'clinic') {
      const clinicData = await kv.get(`clinic:${userId}`);
      if (!clinicData?.approved) {
        return c.json({ error: 'Clinic account pending approval' }, 403);
      }
    }

    // Return user data with role-specific info
    let userData = { ...userProfile };

    if (userProfile.role === 'mother') {
      const motherData = await kv.get(`mother:${userId}`);
      if (motherData) {
        userData = {
          ...userData,
          lmp: motherData.lmp,
          dueDate: motherData.dueDate,
          pregnancyStage: motherData.lmp ? calculatePregnancyWeeks(motherData.lmp) : '0 weeks',
          hasBaby: motherData.hasBaby,
        };
      }
    }

    return c.json({ user: userData, message: 'Login successful' });
  } catch (error: any) {
    console.log('Login error:', error);
    return c.json({ error: error.message || 'Login failed' }, 500);
  }
});

// Get current user session
app.get("/make-server-af101b5e/auth/session", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    let userData = { ...userProfile };

    if (userProfile.role === 'mother') {
      const motherData = await kv.get(`mother:${user.id}`);
      if (motherData) {
        userData = {
          ...userData,
          lmp: motherData.lmp,
          dueDate: motherData.dueDate,
          pregnancyStage: motherData.lmp ? calculatePregnancyWeeks(motherData.lmp) : '0 weeks',
          hasBaby: motherData.hasBaby,
        };
      }
    }

    return c.json({ user: userData });
  } catch (error: any) {
    console.log('Session error:', error);
    return c.json({ error: error.message || 'Session check failed' }, 500);
  }
});

// Logout
app.post("/make-server-af101b5e/auth/logout", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({ message: 'Logout successful' });
  } catch (error: any) {
    console.log('Logout error:', error);
    return c.json({ error: error.message || 'Logout failed' }, 500);
  }
});

// ==================== PROFILE ENDPOINTS ====================

// Update user profile
app.put("/make-server-af101b5e/profile", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const userProfile = await kv.get(`user:${user.id}`);

    const updatedProfile = {
      ...userProfile,
      ...body,
      id: user.id, // Prevent ID change
      email: userProfile.email, // Prevent email change
      role: userProfile.role, // Prevent role change
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}`, updatedProfile);

    // Update mother-specific data if applicable
    if (userProfile.role === 'mother' && (body.lmp || body.hasBaby !== undefined)) {
      const motherData = await kv.get(`mother:${user.id}`) || {};
      const updatedMotherData = {
        ...motherData,
        ...(body.lmp && {
          lmp: body.lmp,
          dueDate: calculateDueDate(body.lmp),
          pregnancyStage: calculatePregnancyWeeks(body.lmp),
        }),
        ...(body.hasBaby !== undefined && { hasBaby: body.hasBaby }),
        ...(body.babyBirthDate && { babyBirthDate: body.babyBirthDate }),
      };
      await kv.set(`mother:${user.id}`, updatedMotherData);
    }

    return c.json({ profile: updatedProfile });
  } catch (error: any) {
    console.log('Profile update error:', error);
    return c.json({ error: error.message || 'Profile update failed' }, 500);
  }
});

// ==================== PREGNANCY TRACKING ENDPOINTS ====================

// Get pregnancy data
app.get("/make-server-af101b5e/pregnancy/:motherId", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const motherId = c.req.param('motherId');
    
    // Only allow mothers to view their own data or clinic/admin to view any
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role === 'mother' && user.id !== motherId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const motherData = await kv.get(`mother:${motherId}`);
    if (!motherData) {
      return c.json({ error: 'Mother data not found' }, 404);
    }

    const measurements = await kv.get(`pregnancy:measurements:${motherId}`) || [];
    const appointments = await kv.get(`pregnancy:appointments:${motherId}`) || [];

    return c.json({
      ...motherData,
      pregnancyStage: motherData.lmp ? calculatePregnancyWeeks(motherData.lmp) : '0 weeks',
      measurements,
      appointments,
    });
  } catch (error: any) {
    console.log('Get pregnancy data error:', error);
    return c.json({ error: error.message || 'Failed to get pregnancy data' }, 500);
  }
});

// Add pregnancy measurement
app.post("/make-server-af101b5e/pregnancy/:motherId/measurement", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const motherId = c.req.param('motherId');
    const body = await c.req.json();

    const measurements = await kv.get(`pregnancy:measurements:${motherId}`) || [];
    const newMeasurement = {
      id: generateId(),
      ...body,
      recordedBy: user.id,
      recordedAt: new Date().toISOString(),
    };

    measurements.push(newMeasurement);
    await kv.set(`pregnancy:measurements:${motherId}`, measurements);

    return c.json({ measurement: newMeasurement });
  } catch (error: any) {
    console.log('Add measurement error:', error);
    return c.json({ error: error.message || 'Failed to add measurement' }, 500);
  }
});

// ==================== APPOINTMENT ENDPOINTS ====================

// Get appointments
app.get("/make-server-af101b5e/appointments", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    let appointmentIds = [];

    if (userProfile.role === 'mother') {
      appointmentIds = await kv.get(`appointments:mother:${user.id}`) || [];
    } else if (userProfile.role === 'clinic') {
      appointmentIds = await kv.get(`appointments:clinic:${user.id}`) || [];
    } else if (userProfile.role === 'admin') {
      // Admin can see all appointments
      const allAppointments = await kv.getByPrefix('appointment:');
      return c.json({ appointments: allAppointments.map(item => item.value) });
    }

    const appointments = await Promise.all(
      appointmentIds.map(async (id: string) => await kv.get(`appointment:${id}`))
    );

    return c.json({ appointments: appointments.filter(a => a !== null) });
  } catch (error: any) {
    console.log('Get appointments error:', error);
    return c.json({ error: error.message || 'Failed to get appointments' }, 500);
  }
});

// Create appointment
app.post("/make-server-af101b5e/appointments", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { clinicId, date, time, reason, type } = body;

    const appointmentId = generateId();
    const appointment = {
      id: appointmentId,
      motherId: user.id,
      clinicId,
      date,
      time,
      reason,
      type,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: '',
    };

    await kv.set(`appointment:${appointmentId}`, appointment);

    // Add to mother's appointments
    const motherAppts = await kv.get(`appointments:mother:${user.id}`) || [];
    motherAppts.push(appointmentId);
    await kv.set(`appointments:mother:${user.id}`, motherAppts);

    // Add to clinic's appointments
    const clinicAppts = await kv.get(`appointments:clinic:${clinicId}`) || [];
    clinicAppts.push(appointmentId);
    await kv.set(`appointments:clinic:${clinicId}`, clinicAppts);

    // Create notification for clinic
    await createNotification(
      clinicId,
      'New appointment request',
      `New appointment request for ${date} at ${time}`,
      'appointment'
    );

    return c.json({ appointment });
  } catch (error: any) {
    console.log('Create appointment error:', error);
    return c.json({ error: error.message || 'Failed to create appointment' }, 500);
  }
});

// Update appointment
app.put("/make-server-af101b5e/appointments/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const appointmentId = c.req.param('id');
    const body = await c.req.json();

    const appointment = await kv.get(`appointment:${appointmentId}`);
    if (!appointment) {
      return c.json({ error: 'Appointment not found' }, 404);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    
    // Only clinic/admin can update appointments
    if (userProfile.role === 'mother') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updatedAppointment = {
      ...appointment,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`appointment:${appointmentId}`, updatedAppointment);

    // Notify mother of status change
    if (body.status) {
      await createNotification(
        appointment.motherId,
        'Appointment updated',
        `Your appointment status: ${body.status}`,
        'appointment'
      );
    }

    return c.json({ appointment: updatedAppointment });
  } catch (error: any) {
    console.log('Update appointment error:', error);
    return c.json({ error: error.message || 'Failed to update appointment' }, 500);
  }
});

// Delete appointment
app.delete("/make-server-af101b5e/appointments/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const appointmentId = c.req.param('id');
    const appointment = await kv.get(`appointment:${appointmentId}`);
    
    if (!appointment) {
      return c.json({ error: 'Appointment not found' }, 404);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    
    // Only the mother who created it or clinic/admin can delete
    if (userProfile.role === 'mother' && appointment.motherId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await kv.del(`appointment:${appointmentId}`);

    // Remove from mother's list
    const motherAppts = await kv.get(`appointments:mother:${appointment.motherId}`) || [];
    await kv.set(
      `appointments:mother:${appointment.motherId}`,
      motherAppts.filter((id: string) => id !== appointmentId)
    );

    // Remove from clinic's list
    const clinicAppts = await kv.get(`appointments:clinic:${appointment.clinicId}`) || [];
    await kv.set(
      `appointments:clinic:${appointment.clinicId}`,
      clinicAppts.filter((id: string) => id !== appointmentId)
    );

    return c.json({ message: 'Appointment deleted' });
  } catch (error: any) {
    console.log('Delete appointment error:', error);
    return c.json({ error: error.message || 'Failed to delete appointment' }, 500);
  }
});

// ==================== EDUCATION ENDPOINTS ====================

// Get educational content
app.get("/make-server-af101b5e/education", async (c) => {
  try {
    const category = c.req.query('category');
    
    if (category) {
      const contentIds = await kv.get(`education:category:${category}`) || [];
      const content = await Promise.all(
        contentIds.map(async (id: string) => await kv.get(`education:${id}`))
      );
      return c.json({ content: content.filter(c => c !== null) });
    }

    // Get all education content
    const allContent = await kv.getByPrefix('education:');
    const educationContent = allContent
      .filter(item => !item.key.includes(':category:'))
      .map(item => item.value);

    return c.json({ content: educationContent });
  } catch (error: any) {
    console.log('Get education error:', error);
    return c.json({ error: error.message || 'Failed to get education content' }, 500);
  }
});

// Create educational content (admin only)
app.post("/make-server-af101b5e/education", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const body = await c.req.json();
    const contentId = generateId();
    const content = {
      id: contentId,
      ...body,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`education:${contentId}`, content);

    // Add to category index
    if (body.category) {
      const categoryContent = await kv.get(`education:category:${body.category}`) || [];
      categoryContent.push(contentId);
      await kv.set(`education:category:${body.category}`, categoryContent);
    }

    return c.json({ content });
  } catch (error: any) {
    console.log('Create education content error:', error);
    return c.json({ error: error.message || 'Failed to create content' }, 500);
  }
});

// Update educational content (admin only)
app.put("/make-server-af101b5e/education/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const contentId = c.req.param('id');
    const body = await c.req.json();
    const content = await kv.get(`education:${contentId}`);

    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }

    const updatedContent = {
      ...content,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`education:${contentId}`, updatedContent);

    return c.json({ content: updatedContent });
  } catch (error: any) {
    console.log('Update education content error:', error);
    return c.json({ error: error.message || 'Failed to update content' }, 500);
  }
});

// Delete educational content (admin only)
app.delete("/make-server-af101b5e/education/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const contentId = c.req.param('id');
    const content = await kv.get(`education:${contentId}`);

    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }

    await kv.del(`education:${contentId}`);

    // Remove from category index
    if (content.category) {
      const categoryContent = await kv.get(`education:category:${content.category}`) || [];
      await kv.set(
        `education:category:${content.category}`,
        categoryContent.filter((id: string) => id !== contentId)
      );
    }

    return c.json({ message: 'Content deleted' });
  } catch (error: any) {
    console.log('Delete education content error:', error);
    return c.json({ error: error.message || 'Failed to delete content' }, 500);
  }
});

// ==================== CHAT/MESSAGES ENDPOINTS ====================

// Get messages between two users
app.get("/make-server-af101b5e/messages/:otherUserId", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const otherUserId = c.req.param('otherUserId');
    
    // Get conversation in both directions
    const conversationKey1 = `messages:conversation:${user.id}:${otherUserId}`;
    const conversationKey2 = `messages:conversation:${otherUserId}:${user.id}`;
    
    const messageIds1 = await kv.get(conversationKey1) || [];
    const messageIds2 = await kv.get(conversationKey2) || [];
    
    const allMessageIds = [...messageIds1, ...messageIds2];
    const messages = await Promise.all(
      allMessageIds.map(async (id: string) => await kv.get(`message:${id}`))
    );

    const sortedMessages = messages
      .filter(m => m !== null)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return c.json({ messages: sortedMessages });
  } catch (error: any) {
    console.log('Get messages error:', error);
    return c.json({ error: error.message || 'Failed to get messages' }, 500);
  }
});

// Send message
app.post("/make-server-af101b5e/messages", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { recipientId, content, type = 'text' } = body;

    const messageId = generateId();
    const message = {
      id: messageId,
      senderId: user.id,
      recipientId,
      content,
      type,
      createdAt: new Date().toISOString(),
      read: false,
    };

    await kv.set(`message:${messageId}`, message);

    // Add to conversation
    const conversationKey = `messages:conversation:${user.id}:${recipientId}`;
    const conversationMessages = await kv.get(conversationKey) || [];
    conversationMessages.push(messageId);
    await kv.set(conversationKey, conversationMessages);

    // Create notification for recipient
    await createNotification(
      recipientId,
      'New message',
      `You have a new message`,
      'message'
    );

    return c.json({ message });
  } catch (error: any) {
    console.log('Send message error:', error);
    return c.json({ error: error.message || 'Failed to send message' }, 500);
  }
});

// Get conversations for current user
app.get("/make-server-af101b5e/conversations", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all conversation keys for this user
    const allConversations = await kv.getByPrefix(`messages:conversation:${user.id}:`);
    
    const conversations = await Promise.all(
      allConversations.map(async (conv) => {
        const otherUserId = conv.key.split(':').pop();
        const otherUserProfile = await kv.get(`user:${otherUserId}`);
        const messageIds = conv.value || [];
        
        if (messageIds.length === 0) return null;
        
        const lastMessage = await kv.get(`message:${messageIds[messageIds.length - 1]}`);
        
        return {
          userId: otherUserId,
          user: otherUserProfile,
          lastMessage,
          unreadCount: 0, // Can be calculated if needed
        };
      })
    );

    return c.json({ conversations: conversations.filter(c => c !== null) });
  } catch (error: any) {
    console.log('Get conversations error:', error);
    return c.json({ error: error.message || 'Failed to get conversations' }, 500);
  }
});

// ==================== NOTIFICATION ENDPOINTS ====================

// Get notifications for current user
app.get("/make-server-af101b5e/notifications", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notificationIds = await kv.get(`notifications:user:${user.id}`) || [];
    const notifications = await Promise.all(
      notificationIds.map(async (id: string) => await kv.get(`notification:${id}`))
    );

    return c.json({ 
      notifications: notifications
        .filter(n => n !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  } catch (error: any) {
    console.log('Get notifications error:', error);
    return c.json({ error: error.message || 'Failed to get notifications' }, 500);
  }
});

// Mark notification as read
app.put("/make-server-af101b5e/notifications/:id/read", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notificationId = c.req.param('id');
    const notification = await kv.get(`notification:${notificationId}`);

    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    if (notification.userId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updatedNotification = {
      ...notification,
      read: true,
      readAt: new Date().toISOString(),
    };

    await kv.set(`notification:${notificationId}`, updatedNotification);

    return c.json({ notification: updatedNotification });
  } catch (error: any) {
    console.log('Mark notification as read error:', error);
    return c.json({ error: error.message || 'Failed to mark notification as read' }, 500);
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Get all users (admin only)
app.get("/make-server-af101b5e/admin/users", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const allUsers = await kv.getByPrefix('user:');
    const users = allUsers
      .filter(item => !item.key.includes(':email:'))
      .map(item => item.value);

    return c.json({ users });
  } catch (error: any) {
    console.log('Get all users error:', error);
    return c.json({ error: error.message || 'Failed to get users' }, 500);
  }
});

// Get pending clinics (admin only)
app.get("/make-server-af101b5e/admin/pending-clinics", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const pendingClinicIds = await kv.get('system:pending-clinics') || [];
    const clinics = await Promise.all(
      pendingClinicIds.map(async (id: string) => {
        const userProfile = await kv.get(`user:${id}`);
        const clinicData = await kv.get(`clinic:${id}`);
        return { ...userProfile, ...clinicData };
      })
    );

    return c.json({ clinics: clinics.filter(c => c !== null) });
  } catch (error: any) {
    console.log('Get pending clinics error:', error);
    return c.json({ error: error.message || 'Failed to get pending clinics' }, 500);
  }
});

// Approve clinic (admin only)
app.post("/make-server-af101b5e/admin/clinics/:clinicId/approve", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const clinicId = c.req.param('clinicId');
    const clinicData = await kv.get(`clinic:${clinicId}`);

    if (!clinicData) {
      return c.json({ error: 'Clinic not found' }, 404);
    }

    const updatedClinicData = {
      ...clinicData,
      approved: true,
      approvedAt: new Date().toISOString(),
      approvedBy: user.id,
    };

    await kv.set(`clinic:${clinicId}`, updatedClinicData);

    // Remove from pending list
    const pendingClinics = await kv.get('system:pending-clinics') || [];
    await kv.set(
      'system:pending-clinics',
      pendingClinics.filter((id: string) => id !== clinicId)
    );

    // Notify clinic
    await createNotification(
      clinicId,
      'Account approved',
      'Your clinic account has been approved',
      'system'
    );

    return c.json({ clinic: updatedClinicData });
  } catch (error: any) {
    console.log('Approve clinic error:', error);
    return c.json({ error: error.message || 'Failed to approve clinic' }, 500);
  }
});

// Delete user (admin only)
app.delete("/make-server-af101b5e/admin/users/:userId", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const userId = c.req.param('userId');
    const targetUser = await kv.get(`user:${userId}`);

    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Delete user profile
    await kv.del(`user:${userId}`);
    await kv.del(`user:email:${targetUser.email}`);

    // Delete role-specific data
    if (targetUser.role === 'mother') {
      await kv.del(`mother:${userId}`);
    } else if (targetUser.role === 'clinic') {
      await kv.del(`clinic:${userId}`);
    }

    // Delete from Supabase Auth
    await supabase.auth.admin.deleteUser(userId);

    return c.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.log('Delete user error:', error);
    return c.json({ error: error.message || 'Failed to delete user' }, 500);
  }
});

// Create user by admin
app.post("/make-server-af101b5e/admin/users/create", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const body = await c.req.json();
    const { email, password, name, role, phone, location, lmp } = body;

    // Check if user already exists in KV
    const existingUserId = await kv.get(`user:email:${email}`);
    if (existingUserId) {
      return c.json({ error: 'A user with this email address has already been registered' }, 400);
    }

    // Try to delete any existing unconfirmed user in Supabase Auth first
    try {
      const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingAuthUsers?.users?.find(u => u.email === email);
      if (existingUser && !existingUser.email_confirmed_at) {
        console.log('Deleting unconfirmed user:', email);
        await supabase.auth.admin.deleteUser(existingUser.id);
      }
    } catch (cleanupError) {
      console.log('Cleanup error (non-fatal):', cleanupError);
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server is not configured
      user_metadata: {
        name,
        role,
        phone,
        location,
      },
    });

    if (authError) {
      console.log('Admin create user auth error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    if (!authData.user) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    const userId = authData.user.id;

    // Store user profile
    const userProfileData = {
      id: userId,
      email,
      name,
      role,
      phone,
      location,
      createdAt: new Date().toISOString(),
      createdBy: user.id, // Track that admin created this user
    };

    await kv.set(`user:${userId}`, userProfileData);
    await kv.set(`user:email:${email}`, userId);

    // Handle role-specific data
    if (role === 'mother' && lmp) {
      const motherData = {
        userId,
        lmp,
        dueDate: calculateDueDate(lmp),
        createdAt: new Date().toISOString(),
      };
      await kv.set(`mother:${userId}`, motherData);
    } else if (role === 'clinic') {
      const clinicData = {
        userId,
        approved: true, // Auto-approve clinics created by admin
        approvedAt: new Date().toISOString(),
        approvedBy: user.id,
        createdAt: new Date().toISOString(),
      };
      await kv.set(`clinic:${userId}`, clinicData);
    }

    return c.json({ user: userProfileData });
  } catch (error: any) {
    console.log('Admin create user error:', error);
    return c.json({ error: error.message || 'Failed to create user' }, 500);
  }
});

// Make specific email an admin (system endpoint)
app.post("/make-server-af101b5e/admin/make-admin", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    // Find user by email
    const userId = await kv.get(`user:email:${email}`);
    
    if (!userId) {
      return c.json({ error: 'User not found' }, 404);
    }

    const userProfile = await kv.get(`user:${userId}`);
    
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Update role to admin
    const updatedProfile = {
      ...userProfile,
      role: 'admin',
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, updatedProfile);

    // Update Supabase Auth metadata
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...userProfile,
        role: 'admin',
      },
    });

    return c.json({ user: updatedProfile, message: 'User role updated to admin' });
  } catch (error: any) {
    console.log('Make admin error:', error);
    return c.json({ error: error.message || 'Failed to update user role' }, 500);
  }
});

// ==================== CLINIC ENDPOINTS ====================

// Get patients (clinic only)
app.get("/make-server-af101b5e/clinic/patients", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'clinic') {
      return c.json({ error: 'Forbidden - Clinic only' }, 403);
    }

    // Get all appointments for this clinic to find patients
    const appointmentIds = await kv.get(`appointments:clinic:${user.id}`) || [];
    const appointments = await Promise.all(
      appointmentIds.map(async (id: string) => await kv.get(`appointment:${id}`))
    );

    // Get unique patient IDs
    const patientIds = [...new Set(appointments.map(a => a?.motherId).filter(Boolean))];
    
    // Get patient profiles
    const patients = await Promise.all(
      patientIds.map(async (id: string) => {
        const userProfile = await kv.get(`user:${id}`);
        const motherData = await kv.get(`mother:${id}`);
        return {
          ...userProfile,
          ...motherData,
          pregnancyStage: motherData?.lmp ? calculatePregnancyWeeks(motherData.lmp) : '0 weeks',
        };
      })
    );

    return c.json({ patients: patients.filter(p => p !== null) });
  } catch (error: any) {
    console.log('Get patients error:', error);
    return c.json({ error: error.message || 'Failed to get patients' }, 500);
  }
});

// Get available clinics
app.get("/make-server-af101b5e/clinics", async (c) => {
  try {
    const allClinics = await kv.getByPrefix('clinic:');
    
    const clinics = await Promise.all(
      allClinics.map(async (item) => {
        const clinicData = item.value;
        if (!clinicData.approved) return null;
        
        const userId = clinicData.userId;
        const userProfile = await kv.get(`user:${userId}`);
        
        return {
          id: userId,
          name: userProfile.name,
          location: userProfile.location,
          phone: userProfile.phone,
          email: userProfile.email,
        };
      })
    );

    return c.json({ clinics: clinics.filter(c => c !== null) });
  } catch (error: any) {
    console.log('Get clinics error:', error);
    return c.json({ error: error.message || 'Failed to get clinics' }, 500);
  }
});

// ==================== HELPER FUNCTIONS ====================

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculatePregnancyWeeks(lmp: string): string {
  if (!lmp) return '0 weeks';
  
  const lmpDate = new Date(lmp);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  
  return `${weeks} weeks${days > 0 ? ` ${days} days` : ''}`;
}

function calculateDueDate(lmp: string): string {
  const date = new Date(lmp);
  date.setDate(date.getDate() + 280); // 40 weeks
  return date.toISOString().split('T')[0];
}

async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string
): Promise<void> {
  const notificationId = generateId();
  const notification = {
    id: notificationId,
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  };

  await kv.set(`notification:${notificationId}`, notification);

  const userNotifications = await kv.get(`notifications:user:${userId}`) || [];
  userNotifications.push(notificationId);
  await kv.set(`notifications:user:${userId}`, userNotifications);
}

Deno.serve(app.fetch);