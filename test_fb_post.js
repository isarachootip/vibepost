const FACEBOOK_PAGE_ID = "100063481152764";
// ⚠️ สำคัญมาก: คุณต้องนำ Page Access Token ของเพจนี้มาใส่ที่นี่
// สามารถไปสร้างชั่วคราวได้ที่ https://developers.facebook.com/tools/explorer/
const PAGE_ACCESS_TOKEN = "ใส่_PAGE_ACCESS_TOKEN_ของคุณที่นี่"; 

const IMAGE_URL = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop"; // เปลี่ยนเป็น URL รูปภาพที่คุณต้องการ
const MESSAGE = "สวัสดีครับ นี่คือการทดสอบโพสต์ภาพอัตโนมัติจาก VibePost Auto-Post System 🚀 #VibePost #AutoPost";

async function testFacebookPost() {
  if (PAGE_ACCESS_TOKEN === "ใส่_PAGE_ACCESS_TOKEN_ของคุณที่นี่") {
    console.error("❌ ขัดข้อง: กรุณาใส่ PAGE_ACCESS_TOKEN ก่อนรันสคริปต์นี้");
    return;
  }

  console.log("กำลังส่งคำขอไปที่ Facebook Graph API...");
  
  const url = `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/photos`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: IMAGE_URL,
        message: MESSAGE,
        access_token: PAGE_ACCESS_TOKEN
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ การโพสต์ล้มเหลว:", data.error.message);
    } else {
      console.log("✅ โพสต์สำเร็จ! ไอดีของโพสต์คือ:", data.post_id);
      console.log("ไอดีรูปภาพคือ:", data.id);
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ:", error);
  }
}

testFacebookPost();
