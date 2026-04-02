import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useParams } from 'react-router' // ✅ FIXED (important)

/* ── NAV ITEMS ───────────────────────── */
const NAV_ITEMS = [
  { id: 'technical', label: 'Technical Questions' },
  { id: 'behavioral', label: 'Behavioral Questions' },
  { id: 'roadmap', label: 'Road Map' },
]

/* ── QUESTION CARD ───────────────────── */
const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className='q-card'>
      <div className='q-card__header' onClick={() => setOpen(prev => !prev)}>
        <span className='q-card__index'>Q{index + 1}</span>
        <p className='q-card__question'>{item?.question}</p>
      </div>

      {open && (
        <div className='q-card__body'>
          <div className='q-card__section'>
            <span className='q-card__tag q-card__tag--intention'>Intention</span>
            <p>{item?.intention}</p>
          </div>

          <div className='q-card__section'>
            <span className='q-card__tag q-card__tag--answer'>Answer</span>
            <p>{item?.answer}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── ROADMAP DAY ─────────────────────── */
const RoadMapDay = ({ day }) => (
  <div className='roadmap-day'>
    <div className='roadmap-day__header'>
      <span className='roadmap-day__badge'>Day {day?.day}</span>
      <h3 className='roadmap-day__focus'>{day?.focus}</h3>
    </div>

    <ul className='roadmap-day__tasks'>
      {day?.tasks?.map((task, i) => (
        <li key={i}>
          <span className='roadmap-day__bullet' />
          {task}
        </li>
      ))}
    </ul>
  </div>
)

/* ── MAIN COMPONENT ──────────────────── */
const Interview = () => {
  const [activeNav, setActiveNav] = useState('technical')
  const [error, setError] = useState(null)

  const { report, getReportById, loading,getResumePdf } = useInterview()
  const { interviewId } = useParams()

  /* ── FETCH DATA ───────────────────── */
  useEffect(() => {
    if (!interviewId) return

    const fetchData = async () => {
      try {
        const res = await getReportById(interviewId)

        // 🔥 IMPORTANT: handle null response
        if (!res) {
          setError("Report not found")
        }
      } catch (err) {
        console.error(err)
        setError("Failed to load report")
      }
    }

    fetchData()
  }, [interviewId]) // ✅ dependency fixed

  /* ── STATES ───────────────────────── */
  if (loading && !report) {
    return (
      <main className='loading-screen'>
        <h1>Loading your interview plan...</h1>
      </main>
    )
  }

  if (error) {
    return (
      <main className='loading-screen'>
        <h1>{error}</h1>
      </main>
    )
  }

  if (!report) {
    return (
      <main className='loading-screen'>
        <h1>No interview report found</h1>
      </main>
    )
  }

  /* ── SCORE COLOR ──────────────────── */
  const scoreClass =
    report.matchScore >= 80 ? 'score--high' :
    report.matchScore >= 60 ? 'score--mid' : 'score--low'

  /* ── UI ───────────────────────────── */
  return (
    <div className='interview-page'>
      <div className='interview-layout'>

        {/* LEFT NAV */}
        <nav className='interview-nav'>          
          <p className='interview-nav__label'>Sections</p>

          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              {item.label}
            </button>
          ))}


         <button
  onClick={async () => {
    try {
      setError(null);   // 🔴 clear previous error

      await getResumePdf(interviewId);   // 🔴 wait for completion

    } catch (err) {
      console.error(err);

      setError(err.message);   // 🔴 show backend message (503 etc)
    }
  }}
  className='button primary-button'
>
  <svg
    height={"0.8rem"}
    style={{ marginRight: "0.8rem" }}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path>
  </svg>
  {loading?"Downloading Resume...":"Download Resume"}
</button>

        </nav>


        <div className='interview-divider' />

        {/* MAIN CONTENT */}
        <main className='interview-content'>

          {/* TECHNICAL */}
          {activeNav === 'technical' && (
            <section>
              <div className='content-header'>
                <h2>Technical Questions</h2>
                <span className='content-header__count'>
                  {report.technicalQuestions?.length || 0}
                </span>
              </div>

              <div className='q-list'>
                {report.technicalQuestions?.length > 0
                  ? report.technicalQuestions.map((q, i) => (
                      <QuestionCard key={i} item={q} index={i} />
                    ))
                  : <p>No technical questions available</p>}
              </div>
            </section>
          )}

          {/* BEHAVIORAL */}
          {activeNav === 'behavioral' && (
            <section>
              <div className='content-header'>
                <h2>Behavioral Questions</h2>
                <span className='content-header__count'>
                  {report.behavioralQuestions?.length || 0}
                </span>
              </div>

              <div className='q-list'>
                {report.behavioralQuestions?.length > 0
                  ? report.behavioralQuestions.map((q, i) => (
                      <QuestionCard key={i} item={q} index={i} />
                    ))
                  : <p>No behavioral questions available</p>}
              </div>
            </section>
          )}

          {/* ROADMAP */}
          {activeNav === 'roadmap' && (
            <section>
              <div className='content-header'>
                <h2>Preparation Plan</h2>
                <span className='content-header__count'>
                  {report.preparationPlan?.length || 0} days
                </span>
              </div>

              <div className='roadmap-list'>
                {report.preparationPlan?.length > 0
                  ? report.preparationPlan.map(day => (
                      <RoadMapDay key={day.day} day={day} />
                    ))
                  : <p>No roadmap available</p>}
              </div>
            </section>
          )}

        </main>

        <div className='interview-divider' />

        {/* SIDEBAR */}
        <aside className='interview-sidebar'>

          <div className='match-score'>
            <p className='match-score__label'>Match Score</p>

            <div className={`match-score__ring ${scoreClass}`}>
              <span className='match-score__value'>{report.matchScore || 0}</span>
              <span className='match-score__pct'>%</span>
            </div>
          </div>

          <div className='sidebar-divider' />

          <div className='skill-gaps'>
            <p className='skill-gaps__label'>Skill Gaps</p>

            <div className='skill-gaps__list'>
              {report.skillsGap?.length > 0
                ? report.skillsGap.map((gap, i) => (
                    <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                      {gap.skill}
                    </span>
                  ))
                : <p>No skill gaps found</p>}
            </div>
          </div>

        </aside>

      </div>
    </div>
  )
}

export default Interview