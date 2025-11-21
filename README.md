# ResumeAI Builder

**ResumeAI Builder** is a powerful, intelligent web application designed to transform rough career notes into polished, industry-standard Resumes, Curriculum Vitae (CVs), and persuasive Cover Letters. Powered by **Google's Gemini 2.5 Flash model**, it tailors content specifically to your target job niche.

> ⚠️ **SECURITY WARNING**: API keys are stored in `.env` files. Never commit these to version control (already in `.gitignore` ✓). In production, use a secrets manager. Also, **the backend currently uses filesystem storage** - migrate to PostgreSQL before going live.

---

## 🚀 Key Features

### 1. Three Distinct Modes
*   **Resume Builder:** Focuses on concise, result-oriented 1-2 page documents ideal for corporate jobs in the US/Tech markets.
*   **Professional CV:** A comprehensive mode for academic, research, executive, or international roles. Supports **Profile Photos**, **Publications**, **Certifications**, and detailed **Academic History**.
*   **Cover Letter Generator:** sophisticated AI writing that takes your profile data + a specific job description to generate a highly persuasive, custom-tailored letter.

### 2. Intelligent AI Content Generation
*   **Rough Notes to Bullet Points:** You don't need to be a writer. Just type "Managed team of 5, used React" and the AI expands it into: *"Led a cross-functional team of 5 developers in architecting scalable frontend solutions using React.js, improving development velocity by 20%."*
*   **Niche Optimization:** Select a target role (e.g., "Software Engineer", "Nurse", "Executive"), and the AI adjusts the tone and terminology accordingly.
*   **Summary Writer:** Automatically generates a professional summary based on your entered experience.

### 3. Professional Templates
The platform includes a variety of ATS-friendly and visually appealing templates:
*   **Modern:** Clean, 2-column layout with colored headers.
*   **Classic:** Traditional, top-down layout perfect for conservative industries.
*   **Sidebar:** High-contrast layout with a dedicated skills sidebar.
*   **Minimalist:** Elegant, whitespace-heavy design for executives.
*   **Corporate (CV):** High-end look with profile photo, shaded sidebar, and glassmorphism effects.
*   **Academic (CV):** Serif fonts, rigorous structure focusing on education, research, and publications.

### 4. Rich Data Sections
Beyond standard experience, users can add:
*   **Internships:** Distinct section for student/early-career experience.
*   **Volunteering:** Highlight community impact and leadership.
*   **Projects:** Showcase portfolio work with links and descriptions.
*   **Publications & Certifications:** Critical for CV mode.

### 5. Privacy & Export
*   **Client-Side Processing:** No database required for basic usage.
*   **PDF Export:** Utilizes browser-native "Save as PDF" with highly optimized CSS print media queries to ensure perfect margins, no page breaks inside sections, and high-resolution text.

---

## 🛠️ Tech Stack

*   **Frontend Framework:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **AI Integration:** Google GenAI SDK (`@google/genai`) using the **Gemini 2.5 Flash** model.
*   **Icons:** Custom SVG Components (Lucide-style).

---

## 📦 Setup & Installation

### Prerequisites
*   Node.js (v18 or higher recommended)
*   A Google Gemini API Key (Get one at [aistudio.google.com](https://aistudio.google.com/))

### Installation Steps

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/resume-ai-builder.git
    cd resume-ai-builder
    ```

2.  **Install Dependencies**
    
    **Backend:**
    ```bash
    cd backend
    npm install
    ```

    **Frontend:**
    ```bash
    cd frontend
    npm install
    ```

3.  **Configure Environment Variables**
    
    **Backend** - Create `backend/.env`:
    ```env
    PORT=3001
    GEMINI_API_KEY=your_google_gemini_api_key_here
    CAMPAY_APP_USER=your_campay_user
    CAMPAY_APP_PASSWORD=your_campay_password
    FRONTEND_URL=http://localhost:5173
    CAMPAY_BASE_URL=https://demo.campay.net/api
    ```

    **Frontend** - Create `frontend/.env`:
    ```env
    VITE_BACKEND_URL=http://localhost:3001
    ```

    Get your Gemini API key at: https://aistudio.google.com/app/apikey

4.  **Run the Application**
    
    **Backend** (Terminal 1):
    ```bash
    cd backend
    npm run dev
    ```

    **Frontend** (Terminal 2):
    ```bash
    cd frontend
    npm run dev
    ```

    Frontend opens at: http://localhost:5173
    Backend runs at: http://localhost:3001

---

## 🚀 Deployment

⚠️ **Before deploying to production**, read `DEPLOYMENT.md` for:
- Database migration guide (filesystem → PostgreSQL)
- Security checklist
- Environment configuration for production
- Monitoring and logging setup
- Payment testing procedures

Quick start: `QUICK_START.md`

---

## 📖 Usage Guide

### Creating a Resume or CV
1.  **Select Mode:** Use the toggle at the top to choose **Resume** or **Professional CV**.
2.  **Choose Template:** Pick a visual style (e.g., Modern, Corporate).
3.  **Enter Data:**
    *   Fill in personal details (Photo is available in CV mode).
    *   Add experience entries. You only need to provide rough notes.
    *   Add Education, Skills, and Projects.
4.  **Select Niche:** In the dropdown, choose your target role (e.g., "Marketing Specialist").
5.  **Generate:** Click the **"Generate with AI"** button. The AI will rewrite your rough notes into professional prose.
6.  **Preview & Print:** Switch to the Preview tab, check the layout, and click **Download** to save as PDF.

### Creating a Cover Letter
1.  **Select Mode:** Switch to **Cover Letter** mode.
2.  **Input Details:** Enter the Hiring Manager's name, Company Name, and paste the **Job Description**.
3.  **Generate:** The AI will analyze your Resume data *and* the Job Description to write a letter that connects your specific skills to their specific needs.

---

## 🎨 Customization

*   **Theme Colors:** Select from Navy, Teal, Green, Charcoal, Burgundy, etc.
*   **Layouts:** Switch templates instantly to see how your data looks in different formats.
*   **Sections:** Add or remove sections like Internships or Volunteering based on your career stage.

---

## 📄 License

This project is open-source and available under the MIT License.
