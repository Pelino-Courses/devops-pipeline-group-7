# Maternal Care Support System - Complete Backend Integration Guide

## Overview

Your Maternal Care Support System now has a fully functional backend integrated with Supabase! The system includes:

- **Real authentication** with Supabase Auth
- **Database storage** using Supabase KV store
- **Role-based access control** (Mother, Clinic, Admin)
- **Complete API** for all features
- **Session persistence** - users stay logged in
- **Real-time data** syncing across the app

## System Architecture

```
Frontend (React + Tailwind) 
    ↓
API Layer (/utils/api.tsx)
    ↓
Backend Server (Supabase Edge Functions)
    ↓
Supabase Auth + KV Store
```

## Getting Started

### 1. Register Users

To test the system, you'll need to create accounts for each role:

#### Create a Mother Account:
1. Click "Register" on login screen
2. Select the "Mother" tab
3. Fill in details:
   - Full Name: e.g., "Marie Uwase"
   - Email: e.g., "marie@example.com"
   - Phone: e.g., "+250 788 123 456"
   - Location: e.g., "Kigali, Rwanda"
   - Last Menstrual Period (optional): Select a date
   - Password: Your secure password
4. Click "Create Account"

#### Create a Clinic Account:
1. Click "Register" on login screen
2. Select the "Clinic" tab
3. Fill in details:
   - Clinic Name: e.g., "Kigali Health Center"
   - Email: e.g., "clinic@example.com"
   - Phone: e.g., "+250 788 123 457"
   - Location: e.g., "Gasabo District, Kigali"
   - Password: Your secure password
4. Click "Create Account"
5. **Note**: Clinic accounts must be approved by an admin before they can login!

#### Create an Admin Account:
1. Click "Register" on login screen
2. Select the "Admin" tab
3. Fill in details:
   - Admin Name: e.g., "System Admin"
   - Email: e.g., "admin@example.com"
   - Phone: e.g., "+250 788 123 458"
   - Location: e.g., "Kigali, Rwanda"
   - Password: Your secure password
4. Click "Create Account"

### 2. Admin Must Approve Clinics

After creating a clinic account:

1. **Login as Admin** using the admin credentials you created
2. Go to "User Management" from the sidebar
3. You'll see pending clinic approvals
4. Click "Approve" on the clinic account
5. Now the clinic can login!

## Features by Role

### Mother Features

#### ✅ Working Features:
- **Authentication**: Register, login, logout with session persistence
- **Pregnancy Tracking**: Track pregnancy weeks automatically based on LMP
- **Appointments**: 
  - Book appointments with approved clinics
  - View upcoming and past appointments
  - Cancel appointments
  - See appointment status (pending, confirmed, completed)
- **Browse Clinics**: View all approved clinics in the system
- **Educational Content**: Browse pre-seeded health education content
- **Profile Management**: Update personal information
- **Notifications**: Receive system notifications

#### 🔄 Ready for Integration (API ready, UI needs connection):
- **Chat**: Send messages to clinic staff
- **Detailed Pregnancy Tracking**: Add measurements, milestones

### Clinic Features

#### ✅ Working Features:
- **Authentication**: Login after admin approval
- **View Patients**: See all mothers who have booked appointments
- **Appointments Management**:
  - View all appointments
  - Update appointment status
  - Add notes to appointments
- **Profile Management**: Update clinic information

#### 🔄 Ready for Integration (API ready, UI needs connection):
- **Messages**: Chat with patients
- **Patient Details**: View detailed pregnancy information
- **Notifications**: Appointment notifications

### Admin Features

#### ✅ Working Features:
- **Authentication**: Full admin access
- **User Management**:
  - View all users (mothers, clinics, admins)
  - Delete users
- **Clinic Approval**:
  - View pending clinic registrations
  - Approve or reject clinics
- **Content Management**:
  - Create educational content
  - Edit existing content
  - Delete content
  - Organize by categories (pregnancy, nutrition, childbirth, baby-care, wellness)

#### 🔄 Ready for Integration:
- **System Analytics**: View statistics
- **Advanced User Management**: Role changes, bulk operations

## API Endpoints Available

All endpoints are fully functional. Here's what's available:

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/session` - Get current session
- `POST /auth/logout` - Logout user

### Profile
- `PUT /profile` - Update user profile

### Appointments
- `GET /appointments` - Get user's appointments
- `POST /appointments` - Create new appointment
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Delete appointment

### Clinics
- `GET /clinics` - Get all approved clinics
- `GET /clinic/patients` - Get clinic's patients (clinic only)

### Education
- `GET /education` - Get educational content
- `POST /education` - Create content (admin only)
- `PUT /education/:id` - Update content (admin only)
- `DELETE /education/:id` - Delete content (admin only)

### Messages
- `GET /conversations` - Get all conversations
- `GET /messages/:otherUserId` - Get messages with specific user
- `POST /messages` - Send message

### Notifications
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark as read

### Admin
- `GET /admin/users` - Get all users
- `GET /admin/pending-clinics` - Get pending clinic approvals
- `POST /admin/clinics/:id/approve` - Approve clinic
- `DELETE /admin/users/:id` - Delete user

### Pregnancy Tracking
- `GET /pregnancy/:motherId` - Get pregnancy data
- `POST /pregnancy/:motherId/measurement` - Add measurement

## Data Storage Structure

The system uses Supabase KV store with the following structure:

```
user:{userId} → User profile data
user:email:{email} → userId lookup
mother:{userId} → Mother-specific data (LMP, due date, etc.)
clinic:{userId} → Clinic data (approval status)
appointment:{appointmentId} → Appointment data
appointments:mother:{motherId} → List of appointment IDs
appointments:clinic:{clinicId} → List of appointment IDs
education:{contentId} → Educational content
education:category:{category} → Content IDs by category
message:{messageId} → Chat message
messages:conversation:{userId1}:{userId2} → Message IDs
notification:{notificationId} → Notification data
notifications:user:{userId} → User's notification IDs
pregnancy:measurements:{motherId} → Pregnancy measurements
system:pending-clinics → Pending clinic approval list
system:seeded → Flag for initial data seeding
```

## Testing the System

### Scenario 1: Mother Books an Appointment

1. **Register as a mother** with LMP date
2. **Admin logs in** and approves a clinic (or register a clinic first)
3. **Mother logs in** and sees pregnancy tracking
4. **Mother navigates** to Appointments
5. **Click "Book"** button
6. **Select clinic**, appointment type, date, and time
7. **Submit** - appointment is created
8. **Mother sees** appointment in "Upcoming" tab
9. **Clinic logs in** and sees the new appointment request
10. **Clinic updates** appointment status to "confirmed"
11. **Mother receives** notification about confirmation

### Scenario 2: Admin Manages Content

1. **Admin logs in**
2. **Navigate** to Content Management
3. **Click "Add Content"**
4. **Fill in** title, category, description, and content
5. **Submit** - content is created
6. **All users** can now see this content in Education section

### Scenario 3: Clinic Reviews Patients

1. **Mother books** appointment with clinic
2. **Clinic logs in**
3. **Navigate** to Patient List
4. **See all patients** who have appointments
5. **View** patient pregnancy information
6. **Update** appointment with notes

## Pre-seeded Data

The system comes with sample educational content:

1. **First Trimester Care** (pregnancy category)
2. **Nutrition During Pregnancy** (nutrition category)
3. **Preparing for Labor** (childbirth category)
4. **Breastfeeding Basics** (baby-care category)
5. **Exercise During Pregnancy** (wellness category)

## Security Features

- ✅ **Authentication required** for all protected endpoints
- ✅ **Role-based access control** - users can only access their role's features
- ✅ **Data isolation** - mothers can only see their own data
- ✅ **Clinic approval** - clinics must be approved before accessing system
- ✅ **Session management** - secure token-based auth
- ✅ **Auto-logout** - sessions handled by Supabase

## Important Notes

### For Production Use:
1. **This is a prototype** - For production, you'll need:
   - HIPAA/GDPR compliance measures
   - Proper email verification
   - Password reset functionality
   - Data encryption at rest
   - Audit logging
   - Backup systems
   - Rate limiting
   - Input validation strengthening

2. **Email Confirmation**: Currently auto-confirmed since no email server is configured

3. **Data Privacy**: This system stores health information - ensure compliance with local regulations

### Current Limitations:
- No email notifications (would need email service)
- No SMS reminders (would need SMS service)
- No real-time chat (WebSocket not implemented)
- No file uploads for medical records
- No video consultation integration

## Extending the System

### To add a new feature:

1. **Backend**: Add endpoint in `/supabase/functions/server/index.tsx`
2. **API Layer**: Add function in `/utils/api.tsx`
3. **Frontend**: Import and use the API function in your component
4. **Update** this guide with the new feature!

### Example - Adding a new endpoint:

```typescript
// In server/index.tsx
app.post("/make-server-af101b5e/my-feature", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  
  // Your logic here
  
  return c.json({ success: true });
});

// In utils/api.tsx
export const myFeatureAPI = {
  async doSomething(data: any) {
    return await request('/my-feature', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// In your component
import { myFeatureAPI } from '../../utils/api';

const result = await myFeatureAPI.doSomething({ ...data });
```

## Troubleshooting

### "User not found" error on login
- Make sure you registered with that email
- Check you're using the correct role tab

### "Clinic account pending approval"
- Login as admin and approve the clinic first

### "Unauthorized" errors
- Your session may have expired - logout and login again
- Check browser console for detailed error messages

### Appointments not showing
- Make sure clinic is approved
- Check you're looking in the right tab (upcoming vs past)
- Verify the appointment date is correct

### Can't see educational content
- Content is pre-seeded on server startup
- Check admin panel to verify content exists

## Support

For issues or questions about the system:
1. Check browser console for error messages
2. Check server logs in Supabase dashboard
3. Review API responses in Network tab
4. Verify authentication token is being sent

## Next Steps

To make this system production-ready:
1. Add email verification
2. Implement password reset
3. Add data export functionality
4. Implement real-time chat with WebSocket
5. Add video consultation features
6. Implement file upload for medical records
7. Add SMS reminder system
8. Implement comprehensive analytics
9. Add multi-language support (Kinyarwanda)
10. Add offline mode support

---

**Remember**: This is a healthcare application prototype. Always consult with healthcare professionals and legal experts before deploying any medical software in production.
