
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [isLogin, setIsLogin] = useState(true);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (token) {
            fetchResumes();
        }
    }, [token]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // ================= AUTH =================

    const handleAuth = async (e) => {
        e.preventDefault();
        setMessage("");

        const endpoint = isLogin
            ? "/api/v1/auth/login"
            : "/api/v1/auth/signup";

        try {
            const response = await fetch(API + endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            if (isLogin) {
                localStorage.setItem("token", data.token);
                setToken(data.token);
            } else {
                setMessage("Account created successfully. Please login.");
                setIsLogin(true);

                setForm({
                    name: "",
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            setMessage(error.message);
        }
    };

    // ================= RESUMES =================

const fetchResumes = async () => {
        try {
            const response = await fetch(
                `${API}/api/resumes/my-resumes`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch resumes");
            }

            setResumes(data.resumes || []);
        } catch (error) {
            console.error(error);
            setMessage(error.message);
        }
    };

    const uploadResume = async () => {
        if (!file) {
            setMessage("Please select a PDF resume.");
            return;
        }

        setLoading(true);
        setMessage("");

        const formData = new FormData();
        formData.append("resume", file);

        try {
            const response = await fetch(
                `${API}/api/resumes/upload`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Upload failed");
            }

            setFile(null);

            const input = document.getElementById("resumeInput");

            if (input) {
                input.value = "";
            }

            setMessage("Resume uploaded successfully.");

            await fetchResumes();
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    // ================= AI ANALYSIS =================

    const analyzeResume = async (id) => {
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${API}/api/ai/resumes/${id}/analyze`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Analysis failed");
            }

            const resume = resumes.find(
                (item) => item._id === id
            );

            if (resume) {
                setSelectedResume({
                    ...resume,
                    analysis: data.analysis
                });
            }

            await fetchResumes();
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    // ================= LOGOUT =================

    const logout = () => {
        localStorage.removeItem("token");

        setToken(null);
        setResumes([]);
        setSelectedResume(null);
        setFile(null);
        setMessage("");
    };

    // ================= LOGIN / SIGNUP =================

    if (!token) {
        return (
            <div className="auth-page">
                <div className="auth-card">

                    <div className="logo">
                        Resume<span>AI</span>
                    </div>

                    <div className="auth-heading">
                        <h1>
                            {isLogin
                                ? "Welcome back"
                                : "Create your account"}
                        </h1>

                        <p>
                            {isLogin
                                ? "Analyze your resume and improve your chances."
                                : "Build a stronger resume with AI-powered insights."}
                        </p>
                    </div>

                    <form onSubmit={handleAuth}>

                        {!isLogin && (
                            <div className="form-group">
                                <label>Full name</label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Email</label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            className="primary-btn"
                            type="submit"
                        >
                            {isLogin
                                ? "Login"
                                : "Create account"}
                        </button>

                    </form>

                    {message && (
                        <p className="message">
                            {message}
                        </p>
                    )}

                    <div className="switch-auth">
                        <span>
                            {isLogin
                                ? "Don't have an account?"
                                : "Already have an account?"}
                        </span>

                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setMessage("");
                            }}
                        >
                            {isLogin
                                ? "Sign up"
                                : "Login"}
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    // ================= DASHBOARD =================

    return (
        <div className="dashboard">

            <header className="navbar">

                <div className="logo">
                    Resume<span>AI</span>
                </div>

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    Logout
                </button>

            </header>

            <main className="dashboard-main">

                {/* HERO */}

                <section className="dashboard-hero">

                    <div className="hero-content">

                        <p className="eyebrow">
                            AI-POWERED RESUME REVIEW
                        </p>

                        <h1>
                            Resume Analyzer
                        </h1>

                        <p className="hero-tagline">
                            Understand how your resume performs
                            and where it can be improved.
                        </p>

                    </div>

                    {/* UPLOAD */}

                    <div className="upload-panel">

                        <div className="upload-icon">
                            ↑
                        </div>

                        <div className="upload-content">

                            <h3>
                                Upload your resume
                            </h3>

                            <p>
                                PDF files only
                            </p>

                            <input
                                id="resumeInput"
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                    setFile(
                                        e.target.files[0] || null
                                    );
                                }}
                            />

                            {file && (
                                <div className="selected-file">
                                    {file.name}
                                </div>
                            )}

                            <button
                                className="primary-btn upload-btn"
                                onClick={uploadResume}
                                disabled={loading}
                            >
                                {loading
                                    ? "Processing..."
                                    : "Upload Resume"}
                            </button>

                        </div>

                    </div>

                </section>

                {/* MESSAGE */}

                {message && (
                    <div className="message dashboard-message">
                        {message}
                    </div>
                )}

                {/* MY RESUMES */}

                <section className="resume-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                My Resumes
                            </h2>

                            <p className="section-tagline">
                                Your uploaded resumes and analysis history.
                            </p>

                        </div>

                        <span className="resume-count">
                            {resumes.length}
                        </span>

                    </div>

                    {resumes.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                +
                            </div>

                            <h3>
                                No resumes yet
                            </h3>

                            <p>
                                Upload your first resume to start your analysis.
                            </p>

                        </div>

                    ) : (

                        <div className="resume-list">

                            {resumes.map((resume) => (

                                <div
                                    className="resume-card"
                                    key={resume._id}
                                >

                                    <div className="resume-info">

                                        <div className="file-icon">
                                            PDF
                                        </div>

                                        <div>

                                            <h3>
                                                {resume.fileName}
                                            </h3>

                                            <p>
                                                Uploaded{" "}
                                                {new Date(
                                                    resume.createdAt
                                                ).toLocaleDateString()}
                                            </p>

                                        </div>

                                    </div>

                                    <div className="resume-action">

                                        {resume.analysis?.score !==
                                            undefined && (
                                            <div className="mini-score">
                                                {resume.analysis.score}

                                                <span>
                                                    /100
                                                </span>
                                            </div>
                                        )}

                                        <button
                                            className="analyze-btn"
                                            onClick={() =>
                                                analyzeResume(
                                                    resume._id
                                                )
                                            }
                                            disabled={loading}
                                        >
                                            {loading
                                                ? "Analyzing..."
                                                : "Analyze"}
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

                {/* ANALYSIS */}

                {selectedResume?.analysis && (
                    <Analysis
                        analysis={selectedResume.analysis}
                        fileName={selectedResume.fileName}
                    />
                )}

            </main>

        </div>
    );
}


// ================= ANALYSIS COMPONENT =================

function Analysis({ analysis, fileName }) {

    const labels = {
        formatting: "Formatting",
        skills: "Skills",
        experienceProjects: "Experience & Projects",
        keywords: "Keywords",
        education: "Education",
        achievements: "Achievements",
        clarity: "Clarity"
    };

    return (
        <section className="analysis-section">

            {/* ANALYSIS HEADER */}

            <div className="analysis-header">

                <div>

                    <p className="eyebrow">
                        AI ANALYSIS
                    </p>

                    <h2>
                        Resume Analysis
                    </h2>

                    <p className="analysis-file">
                        {fileName}
                    </p>

                </div>

                <div className="score-card">

                    <span>
                        Overall Score
                    </span>

                    <strong>
                        {analysis.score}
                    </strong>

                    <small>
                        /100
                    </small>

                </div>

            </div>

            {/* SCORE BREAKDOWN */}

            <div className="breakdown-card">

                <h3>
                    Score Breakdown
                </h3>

                <p className="section-tagline">
                    A category-by-category view of your resume.
                </p>

                <div className="score-list">

                    {Object.entries(
                        analysis.breakdown || {}
                    ).map(([key, value]) => (

                        <div
                            className="score-row"
                            key={key}
                        >

                            <div className="score-label">

                                <span>
                                    {labels[key] || key}
                                </span>

                                <strong>
                                    {value}
                                </strong>

                            </div>

                            <div className="score-bar">

                                <div
                                    style={{
                                        width: `${value * 5}%`
                                    }}
                                />

                            </div>

                        </div>

                    ))}

                </div>

            </div>

            {/* AI INSIGHTS */}

            <div className="analysis-grid">

                <Info
                    title="Summary"
                    items={[
                        analysis.summary
                    ]}
                    large
                />

                <Info
                    title="Skills"
                    items={analysis.skills || []}
                />

                <Info
                    title="Missing Skills"
                    items={analysis.missingSkills || []}
                />

                <Info
                    title="Strengths"
                    items={analysis.strengths || []}
                />

                <Info
                    title="Weaknesses"
                    items={analysis.weaknesses || []}
                />

                <Info
                    title="Suggestions"
                    items={analysis.suggestions || []}
                    large
                />

                <Info
                    title="Recommended Roles"
                    items={analysis.recommendedRoles || []}
                />

            </div>

        </section>
    );
}


// ================= INFO CARD =================

function Info({ title, items, large }) {

    return (
        <div
            className={`info-card ${
                large ? "info-large" : ""
            }`}
        >

            <h3>
                {title}
            </h3>

            <div className="info-content">

                {items.map((item, index) => (
                    <p key={index}>
                        {item}
                    </p>
                ))}

            </div>

        </div>
    );
}

export default App;

