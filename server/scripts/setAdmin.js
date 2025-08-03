const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setFirstUserAsAdmin() {
  try {
    // Find the first user (Justin Howell)
    const user = await prisma.user.findFirst({
      where: {
        email: process.env.ADMIN_EMAIL || 'admin@example.com'
      }
    });

    if (!user) {
      console.log('User not found. Please make sure you have registered first.');
      return;
    }

    // Update the user to have admin role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    });

    console.log(`Successfully set ${updatedUser.email} as admin user.`);
    console.log('User details:', {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error setting admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setFirstUserAsAdmin(); 