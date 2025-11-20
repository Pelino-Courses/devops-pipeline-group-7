import * as kv from './kv_store.tsx';

export async function seedEducationalContent() {
  const educationContent = [
    {
      id: 'edu_1',
      title: 'First Trimester Care',
      category: 'pregnancy',
      description: 'Essential tips for the first 12 weeks of pregnancy',
      content: 'During the first trimester, focus on proper nutrition, prenatal vitamins, and regular checkups...',
      language: 'en',
      videoUrl: null,
      imageUrl: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'edu_2',
      title: 'Nutrition During Pregnancy',
      category: 'nutrition',
      description: 'What to eat and avoid during pregnancy',
      content: 'A balanced diet is crucial for both mother and baby. Focus on fruits, vegetables, lean proteins...',
      language: 'en',
      videoUrl: null,
      imageUrl: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'edu_3',
      title: 'Preparing for Labor',
      category: 'childbirth',
      description: 'What to expect during labor and delivery',
      content: 'Understanding the stages of labor can help reduce anxiety. Pack your hospital bag early...',
      language: 'en',
      videoUrl: null,
      imageUrl: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'edu_4',
      title: 'Breastfeeding Basics',
      category: 'baby-care',
      description: 'Getting started with breastfeeding',
      content: 'Breastfeeding is natural but may take practice. Ensure proper latch and positioning...',
      language: 'en',
      videoUrl: null,
      imageUrl: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'edu_5',
      title: 'Exercise During Pregnancy',
      category: 'wellness',
      description: 'Safe exercises for expectant mothers',
      content: 'Gentle exercise like walking, swimming, and prenatal yoga can be beneficial...',
      language: 'en',
      videoUrl: null,
      imageUrl: null,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const content of educationContent) {
    const existing = await kv.get(`education:${content.id}`);
    if (!existing) {
      await kv.set(`education:${content.id}`, content);
      
      // Add to category index
      const categoryContent = await kv.get(`education:category:${content.category}`) || [];
      if (!categoryContent.includes(content.id)) {
        categoryContent.push(content.id);
        await kv.set(`education:category:${content.category}`, categoryContent);
      }
    }
  }
  
  console.log('Educational content seeded');
}

export async function initializeSeedData() {
  // Check if already seeded
  const seeded = await kv.get('system:seeded');
  if (seeded) {
    console.log('Data already seeded');
    return;
  }

  try {
    await seedEducationalContent();
    await kv.set('system:seeded', true);
    console.log('Initial data seeding complete');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Function to make specific email an admin (run separately)
export async function makeEmailAdmin(email: string) {
  try {
    const userId = await kv.get(`user:email:${email}`);
    
    if (!userId) {
      console.log(`User with email ${email} not found`);
      return false;
    }

    const userProfile = await kv.get(`user:${userId}`);
    
    if (!userProfile) {
      console.log(`User profile for ${email} not found`);
      return false;
    }

    // Update role to admin
    const updatedProfile = {
      ...userProfile,
      role: 'admin',
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, updatedProfile);
    console.log(`Successfully updated ${email} to admin role`);
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
}