import { getAllInterviewReports,generateInterviewReport,getInterviewReportById,generateResumePdf } from "../services/interview.api";
import { useContext } from "react";
import { InterviewContext } from "../interview.context";
import { useEffect } from "react";
export const useInterview=()=>{
    const context=useContext(InterviewContext)

    if(!context){
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {loading,setLoading,report,setReport,reports,setReports}=context

    const generateReport=async({jobDescription,selfDescription,resumeFile})=>{
        setLoading(true)
        let response=null;
        try{
           const response=await generateInterviewReport({jobDescription,selfDescription,resumeFile})
            setReport(response.interviewReport)
            return response.interviewReport;
        }catch(error){
            console.log(error)
            throw error;
        }finally{
            setLoading(false)
        }

        return response.interviewReport;
    }

    const getReportById=async(interviewId)=>{
        setLoading(true)
        let response=null;
        try{
            const response=await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport;

        }catch(error){
            console.log("error")
            throw error;
        }finally{
            setLoading(false)
        }
        return response.interviewReport;

    }

    const getReports=async()=>{
        setLoading(true)
        let response=null;
        try{
           const response=await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports;
        }catch(error){
            console.log("error")
            throw error;
        }finally{
            setLoading(false)
        }
        return response.interviewReports;
    }

    const getResumePdf=async(interviewReportId)=>{
        setLoading(true)
        let response=null;
        try{
            const response=await generateResumePdf(interviewReportId)
            const url=window.URL.createObjectURL(new Blob([response],{type:"application/pdf"}))
            const link=document.createElement("a")
            link.href=url
            link.setAttribute("download",`resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }catch(error){
            console.log("error")
            throw error;
        }finally{
            setLoading(false)
        }
        
    }

    return {loading,report,reports,generateReport,getReportById,getReports,getResumePdf}
    
}