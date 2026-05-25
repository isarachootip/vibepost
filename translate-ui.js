const fs = require('fs');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const [search, replace] of Object.entries(replacements)) {
    // using regex for exact string match within JSX or tags
    // escaping special characters
    const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(searchRegex, replace);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Translated: ' + filePath);
}

// 1. Sidebar
replaceInFile('src/components/layout/sidebar.tsx', {
  '>Overview<': '>ภาพรวมระบบ<',
  '>Workspaces<': '>พื้นที่ทำงาน<',
  '>Content Hub<': '>คลังคอนเทนต์<',
  '>Integrations<': '>การเชื่อมต่อ<',
  '>AI Publisher<': '>โพสต์ด้วย AI<',
  '>Post History<': '>ประวัติการโพสต์<',
  '>Settings<': '>การตั้งค่า<',
  '>System Admin<': '>ผู้ดูแลระบบ<',
  '>Log out<': '>ออกจากระบบ<'
});

// 2. Header
replaceInFile('src/components/layout/header.tsx', {
  'placeholder="Search..."': 'placeholder="ค้นหา..."',
  '>System Admin<': '>ผู้ดูแลระบบ<'
});

// 3. Dashboard Page
replaceInFile('src/app/dashboard/page.tsx', {
  'System Overview': 'ภาพรวมระบบ',
  'Manage auto-post workflow for': 'จัดการระบบโพสต์อัตโนมัติสำหรับ',
  'New Campaign': 'สร้างโพสต์ใหม่',
  '>Total Posts<': '>โพสต์ทั้งหมด<',
  '>Connected Accounts<': '>บัญชีที่เชื่อมต่อ<',
  '>Team Members<': '>สมาชิกในทีม<',
  '>AI Configs<': '>การตั้งค่า AI<',
  '>View Drafts<': '>ดูฉบับร่าง<',
  '>Manage Channels<': '>จัดการช่องทาง<',
  '"Edit Configs"': '"แก้ไขการตั้งค่า"',
  '"Start Setup"': '"เริ่มตั้งค่า"'
});

// 4. Social Connections Page
replaceInFile('src/app/dashboard/social/page.tsx', {
  'Social Connections': 'การเชื่อมต่อโซเชียล',
  'Connect your social media accounts to enable auto-posting.': 'เชื่อมต่อบัญชีโซเชียลมีเดียของคุณเพื่อเปิดใช้งานการโพสต์อัตโนมัติ',
  'Connected Account': 'บัญชีที่เชื่อมต่อแล้ว',
  '"Not connected"': '"ยังไม่เชื่อมต่อ"',
  '"Connected"': '"เชื่อมต่อแล้ว"',
  'Not connected': 'ยังไม่เชื่อมต่อ',
  '>Connected<': '>เชื่อมต่อแล้ว<'
});

// 5. Settings Page
replaceInFile('src/app/dashboard/settings/page.tsx', {
  'Workspace Settings': 'การตั้งค่าพื้นที่ทำงาน',
  'Configure how your content is generated using AI providers.': 'ตั้งค่าผู้ให้บริการ AI ที่ใช้ในการสร้างคอนเทนต์',
  'AI API Configuration': 'การตั้งค่า AI API',
  'Danger Zone': 'พื้นที่อันตราย',
  'Irreversible actions for this workspace.': 'การกระทำที่ไม่สามารถย้อนกลับได้สำหรับพื้นที่ทำงานนี้',
  '>Delete Workspace<': '>ลบพื้นที่ทำงาน<',
  'Permanently remove this workspace and all its data.': 'ลบพื้นที่ทำงานนี้และข้อมูลทั้งหมดอย่างถาวร',
  '>Delete Everything<': '>ลบข้อมูลทั้งหมด<',
  '>Active<': '>ใช้งานอยู่<',
  '>Update<': '>อัปเดต<',
  '>Save<': '>บันทึก<',
  '"Enter API Key..."': '"ใส่ API Key..."',
  'Wait, API Key is already set (••••••••)': 'มีการตั้งค่า API Key แล้ว (••••••••)'
});

// 6. Workspaces Page
replaceInFile('src/app/dashboard/workspaces/page.tsx', {
  'Workspace & Team': 'พื้นที่ทำงานและทีม',
  'Manage access and settings for': 'จัดการสิทธิ์การเข้าถึงและการตั้งค่าสำหรับ',
  'Invite Member': 'เชิญสมาชิก',
  'Workspace Details': 'รายละเอียดพื้นที่ทำงาน',
  '>Workspace Name<': '>ชื่อพื้นที่ทำงาน<',
  '>Workspace ID<': '>รหัสพื้นที่ทำงาน<',
  'Team Members (': 'สมาชิกในทีม (',
  '"Unnamed User"': '"ผู้ใช้ไม่มีชื่อ"',
  '>Owner<': '>เจ้าของ<',
  '>Delete Workspace<': '>ลบพื้นที่ทำงาน<',
  'Remove Member': 'ลบสมาชิก',
  'Additional roles and permission levels will be active after phase 2 deployment. Currently all team members have CREATOR access by default.': 'ระดับสิทธิ์การเข้าถึงแบบละเอียดจะเปิดให้ใช้งานในเฟสที่ 2 ปัจจุบันสมาชิกในทีมทุกคนจะได้รับสิทธิ์ CREATOR เป็นค่าเริ่มต้น'
});

// 7. Multi-Post Wizard (Check for english text)
replaceInFile('src/app/dashboard/multi-post/MultiPostWizard.tsx', {
  'Content Generator Wizard': 'ตัวช่วยสร้างโพสต์ด้วย AI',
  'Select target channels and enter your core topic.': 'เลือกช่องทางเป้าหมายและกรอกหัวข้อหลักของคุณ',
  'Select Social Channels': 'เลือกช่องทางโซเชียล',
  'Where do you want to post?': 'คุณต้องการโพสต์ที่ไหน?',
  'Core Topic & Idea': 'หัวข้อและไอเดียหลัก',
  'What do you want to post about?': 'คุณต้องการโพสต์เกี่ยวกับอะไร?',
  'Attach Media (Optional)': 'แนบรูปภาพ (ไม่บังคับ)',
  'Generate AI Drafts': 'สร้างฉบับร่างด้วย AI',
  'Processing AI Drafts...': 'ระบบ AI กำลังประมวลผล...',
  'AI is generating multiple variations based on your topic.': 'AI กำลังสร้างโพสต์หลายรูปแบบจากหัวข้อของคุณ',
  'Review & Select Draft': 'ตรวจสอบและเลือกฉบับร่าง',
  'Select the best AI-generated content variation.': 'เลือกเนื้อหาจาก AI ที่คุณถูกใจที่สุด',
  'Select Variation': 'เลือกตัวเลือกนี้',
  'Selected': 'ถูกเลือกแล้ว',
  'Review & Schedule': 'ตรวจสอบและตั้งเวลา',
  'Schedule or Publish': 'ตั้งเวลาหรือโพสต์ทันที',
  'Review your selected content and choose when to post.': 'ตรวจสอบเนื้อหาที่เลือกและเลือกเวลาที่จะโพสต์',
  'Publish Date & Time': 'วันที่และเวลาที่จะโพสต์',
  'When should this content go live?': 'คอนเทนต์นี้ควรจะถูกโพสต์เมื่อไหร่?',
  'Post Now (Immediately)': 'โพสต์ทันที',
  'Schedule for Later': 'ตั้งเวลาล่วงหน้า',
  'Select Date': 'เลือกวันที่',
  'Time': 'เวลา',
  'Back': 'ย้อนกลับ',
  'Confirm & Publish': 'ยืนยันและโพสต์ทันที',
  'Confirm & Schedule': 'ยืนยันและตั้งเวลาโพสต์',
  'Posting to Channels...': 'กำลังโพสต์ไปยังช่องทางต่างๆ...',
  'Successfully scheduled!': 'ตั้งเวลาสำเร็จ!',
  'Successfully published!': 'โพสต์สำเร็จ!',
  'Redirecting to history...': 'กำลังพาไปหน้าประวัติ...',
  'Upload Image': 'อัปโหลดรูปภาพ'
});

console.log('UI Translation completed.');
