import React, { useState, useRef,useEffect } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import {useAuth} from "../../hooks/useAuth.js"

const Home = () => {

    const { loading, generateReport,reports,getReports} = useInterview()
    const {handleLogout}=useAuth();

    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [resumeName,setResumeName]=useState(null)
    const [error,setError]=useState(null)
    const [isGenerating,setIsGenerating]=useState(false) // ✅ ADDED (loader)

    const resumeInputRef = useRef()
    const navigate = useNavigate()

    useEffect(() => {
        getReports()
    }, [])

    /* =========================
       ✅ GENERATE REPORT FIX
    ========================== */
    const handleGenerateReport = async () => {
    try {
        setError(null)
        setIsGenerating(true)

        // ✅ SAFE ACCESS (NO CRASH NOW)
        const fileInput = resumeInputRef.current
        const resumeFile = fileInput?.files?.[0]

        // ✅ REAL VALIDATION (YOU WERE FAKING THIS BEFORE)
        if (!resumeFile && !selfDescription.trim()) {
            setError("Either resume or self description is required")
            return
        }

        const data = await generateReport({
            jobDescription,
            selfDescription,
            resumeFile
        })

        // ✅ HANDLE EMPTY RESPONSE (YOU NEVER THINK ABOUT THIS)
        if (!data || !data._id) {
            setError("Failed to generate report. Try again.")
            return
        }

        navigate(`/interview/${data._id}`)

    } catch (err) {
        console.log(err)

        // ✅ HANDLE SERVER OVERLOAD (YOUR REQUIREMENT)
        if (err.message?.includes("503") || err.message?.includes("network")) {
            setError("Server is experiencing heavy load. Please try again after some time.")
        } else {
            setError(err.message || "Something went wrong")
        }

    } finally {
        setIsGenerating(false)
    }
}
 

    const handleLogoutClick=async()=>{
        await handleLogout()
        navigate("/login")
    }

    /* =========================
       ✅ FILE HANDLING FIX
    ========================== */
    const handleFileChange=(e)=>{
        const file=e.target.files[0]
        if(file){
            setResumeName(file.name)
        }
    }

    const handleRemoveFile=()=>{
        setResumeName(null)
        resumeInputRef.current.value=""
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>

            {/* LOGOUT */}
            <div className='logout-container'>
                <button onClick={handleLogoutClick} className="logout-btn">
                    Logout
                </button>
            </div>

            {/* ERROR */}
            {error && (
                <div className='error-text'>
                    <p>{error}</p>
                </div>
            )}

            {/* HEADER */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {/* MAIN CARD */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* LEFT PANEL */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>

                        <textarea
                            onChange={(e) => setJobDescription(e.target.value)}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>0 / 5000 chars</div>
                    </div>

                    <div className='panel-divider' />

                    {/* RIGHT PANEL */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* =========================
                           ✅ FIXED UPLOAD SECTION
                        ========================== */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>

                            {/* ❌ NO FILE */}
                            {!resumeName && (
                                <label className='dropzone' htmlFor='resume'>
                                    <span className='dropzone__icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <polyline points="16 16 12 12 8 16" />
                                            <line x1="12" y1="12" x2="12" y2="21" />
                                        </svg>
                                    </span>
                                    <p className='dropzone__title'>Click to upload or drag & drop</p>
                                    <p className='dropzone__subtitle'>PDF or DOCX (Max 5MB)</p>

                                    <input
                                        ref={resumeInputRef}
                                        hidden
                                        type='file'
                                        id='resume'
                                        name='resume'
                                        accept='.pdf,.docx'
                                        onChange={handleFileChange} // ✅ IMPORTANT FIX
                                    />
                                </label>
                            )}

                            {/* ✅ FILE SELECTED */}
                            {resumeName && (
                                <div className='uploaded-file'>
                                    <p>✅ {resumeName}</p>
                                    <button onClick={handleRemoveFile}>Remove</button>
                                </div>
                            )}
                        </div>

                        <div className='or-divider'><span>OR</span></div>

                        {/* SELF DESCRIPTION */}
                        <div className='self-description'>
                            <label className='section-label'>Quick Self-Description</label>
                            <textarea
                                onChange={(e) => setSelfDescription(e.target.value)}
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        <div className='info-box'>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                {/* =========================
                   ✅ BUTTON WITH LOADING
                ========================== */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation &bull;Approx 30 seconds</span>

                    <button
                        onClick={handleGenerateReport}
                        className='generate-btn'
                        disabled={isGenerating}
                    >
                        {isGenerating ? "Generating... please wait" : "Generate My Interview Strategy"}
                    </button>
                </div>
            </div>

            {/* REPORTS */}
            {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>{new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 70 ? 'score--high' : report.matchScore >= 50 ? 'score--mid' : 'score--low'}`}>
                                    Match Score: {report.matchScore}%
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms</a>
                <a href='#'>Help</a>
            </footer>
        </div>
    )
}

export default Home