# Software Requirements Specification (SRS)
## Project: BizNext (Content Auto-Post System)

### 1. Introduction
This document outlines the software requirements and specifications for the BizNext Content Auto-Post System, an automated social media management platform powered by AI.

### 2. Functional Specifications

#### 2.1 Workspace Management (ระบบจัดการพื้นที่ทำงาน)
* **Isolated Environments:** Users must be able to create isolated "Workspaces" representing individual brands or projects.
* **Data Segregation:** Each workspace maintains its own team members, social connections, and AI configurations independent of others.

#### 2.2 Social Media Integrations (เชื่อมต่อโซเชียลมีเดีย)
* **Platform Support:** The system must connect with major social media platforms including Facebook Page, Instagram, X (Twitter), and LinkedIn.
* **Token Management:** The system must securely handle and refresh OAuth access tokens for automated API interactions.
* **Auto-Posting:** The system must act as an automated dispatcher, capable of transmitting text and media payloads to specified social graph APIs.

#### 2.3 AI-Powered Content Generation (สมองกล AI สร้างคอนเทนต์)
* **Prompt Configuration:** Users can define and store specific instruction sets (Prompts) to dictate the tone, style, and goals of generated content (e.g., "fun style", "hard sell").
* **LLM Integration:** The system will interface with cutting-edge Large Language Models (GPT-4, Claude 3.5, Gemini) via OpenRouter APIs.
* **Autonomous Drafts:** The AI must autonomously generate captions, articles, or hashtags tailored to the brand's context without constant manual drafting.

#### 2.4 Content Hub & Scheduling (ศูนย์กลางจัดการโพสต์และตั้งเวลา)
* **Rich Content Editor:** Users must be able to review and modify AI-generated content drafts using a Rich Text Editor.
* **Post Scheduling:** The module must support precise future-date publishing functionality.
* **Status Tracking:** Posts must have clear lifecycle statuses: `Draft` (ร่าง), `Scheduled` (รอโพสต์), `Published` (โพสต์สำเร็จแล้ว), and `Failed` (โพสต์ไม่สำเร็จ).

#### 2.5 Approval Workflow (ระบบรอการอนุมัติก่อนโพสต์จริง)
* **Third-party Notifications:** Upon AI content generation, the system must trigger a review notification via Discord webhooks or Email.
* **Human-in-the-loop (HITL):** A designated operator must explicitly click an "Approve" action before the content is placed in the active scheduling queue to prevent AI hallucination or context errors on the live social profile.

### 3. Non-Functional Specifications
* **User Interface:** Modern, Premium SaaS Glassmorphism architecture relying on PT Serif typography.
* **Authentication:** Enterprise-grade secure login via NextAuth v5.
* **Database infrastructure:** Relational PostgreSQL managed efficiently via Prisma ORM.

### 4. System Workflow Process (ขั้นตอนการทำงานของระบบ)

#### Phase 1: Setup & Configuration (การตั้งค่าเริ่มต้น)
1. **Workspace Initialization:** User creates a new workspace and invites team members.
2. **Social Integration:** User authenticates and connects their social media accounts (e.g., Facebook, Instagram) to the workspace using secure OAuth flows.
3. **AI Persona Setup:** User configures "Prompt Configs" defining the brand's tone of voice, preferred formatting, and target audience.

#### Phase 2: Content Generation (การสร้างเนื้อหา)
1. **Triggering AI:** User navigates to the Content Hub and initiates a new campaign, selecting the desired "Prompt Config" and providing a brief topic (e.g., "Promotion for Summer Sale").
2. **LLM Processing:** The system forwards the request to the configured AI provider via OpenRouter.
3. **Draft Creation:** The AI returns the generated caption/content, and the system saves it under the `Draft` status.

#### Phase 3: Review & Approval (ตรวจสอบและอนุมัติ)
1. **Notification Dispatch:** The system pushes a notification (webhook to Discord or email) alerting the team that a new draft requires review.
2. **Human Review (HITL):** A manager logs in, reviews the content, edits if necessary in the Rich Text Editor, and sets the schedule timing.
3. **Approval:** The manager clicks "Approve & Schedule." The post status changes from `Draft` to `Scheduled`.

#### Phase 4: Execution & Publishing (การโพสต์จริง)
1. **Background Job:** The server's CRON/Worker queue constantly checks for `Scheduled` posts whose time has arrived.
2. **Dispatch Payload:** When the scheduled time hits, the system fetches the active OAuth tokens and dispatches the post payload to the respective Social Media Graph APIs.
3. **Status Update:** Upon receiving a successful response from the social platforms, the post status updates to `Published`. If an error occurs, it marks as `Failed` and triggers an alert.
