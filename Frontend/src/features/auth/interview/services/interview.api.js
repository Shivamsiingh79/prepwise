import axios from "axios";

const api = axios.create({
    baseURL: "https://prepwise-gfqa.onrender.com",
    withCredentials: true,
})


// 🔴 GENERATE INTERVIEW REPORT
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    try {   // 🔴 ADDED: try-catch

        const formData = new FormData();
        formData.append("jobDescription", jobDescription);
        formData.append("selfDescription", selfDescription);

        if(resumeFile){
             formData.append("resume", resumeFile);


        }
       
        const response = await api.post("/api/interview/", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;

    } catch (err) {   // 🔴 ADDED: error handling

        // 🔥 HANDLE SERVER OVERLOAD (503)
        if (err.response?.status === 503) {
            throw new Error("Server is experiencing heavy load. Please try again later.");
        }

        // 🔥 GENERIC FALLBACK
        throw new Error(err.response?.data?.message || "Failed to generate interview report");
    }
}


// 🔴 GET REPORT BY ID
export const getInterviewReportById = async (interviewId) => {
    try {   // 🔴 ADDED

        const response = await api.get(`/api/interview/report/${interviewId}`);
        return response.data;

    } catch (err) {

        if (err.response?.status === 503) {
            throw new Error("Server is experiencing heavy load. Please try again later.");
        }

        throw new Error("Failed to fetch interview report");
    }
}


// 🔴 GET ALL REPORTS
export const getAllInterviewReports = async () => {
    try {   // 🔴 ADDED

        const response = await api.get("/api/interview/");
        return response.data;

    } catch (err) {

        if (err.response?.status === 503) {
            throw new Error("Server is experiencing heavy load. Please try again later.");
        }

        throw new Error("Failed to fetch interview reports");
    }
}


// 🔴 GENERATE RESUME PDF
export const generateResumePdf = async (interviewReportId) => {
    try {   // 🔴 ADDED

        const response = await api.post(
            `/api/interview/resume/html/${interviewReportId}`,
        );

        return response.data.html;

    } catch (err) {   // 🔴 ADDED

        // 🔥 HANDLE 503
        if (err.response?.status === 503) {
            throw new Error("Server is experiencing heavy load. Please try again later.");
        }

        throw new Error("Failed to download resume");
    }
}