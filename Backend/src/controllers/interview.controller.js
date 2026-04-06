const pdfParse=require("pdf-parse");
const {generateInterviewReport,generateResumePdf}=require("../services/ai.service")
const interviewReportModel=require("../models/interviewReport.model")
async function generateInterviewReportController(req,res){

    
    try{
    const {selfDescription,jobDescription}=req.body;

    let resumeText="";

    if(req.file && req.file.buffer){
        const data=await pdfParse(req.file.buffer);
        resumeText=data.text;
    }

    

    if(!resumeText && !selfDescription){
        return res.status(400).json({
            message:"Either resume or self-description is required to generate interview report"
        })
    }

    const interviewReportByAi=await generateInterviewReport({
        resume:resumeText,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
    user: req.user.id,
    resume: resumeText,
    selfDescription,
    jobDescription,

    title: interviewReportByAi.title,
    matchScore: interviewReportByAi.matchScore,

    technicalQuestions: interviewReportByAi.technicalQuestions.map(q => ({
        question: q.questions,
        intention: q.intention,
        answer: q.answer
    })),

    behavioralQuestions: interviewReportByAi.behavioralquestions.map(q => ({
        question: q.questions,
        intention: q.intention,
        answer: q.answer
    })),

    skillsGap: interviewReportByAi.skillsGap,
    preparationPlan: interviewReportByAi.preparationPlan
});

    res.status(201).json({
        message:"Interview Report generated successfully",
        interviewReport
    });
    } catch(error){
        console.error("AI Service Error:",error.message);

        return res.status(500).json({
            message:"Service is experiencing heavy load. Please try again later"
        });
    }

}

async function getInterviewReportByIdController(req,res){
    const {interviewId} = req.params

    const interviewReport = await interviewReportModel.findOne({
        _id: interviewId,
        user: req.user.id
    })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found"
        })
    }

    res.status(200).json({
        message: "Interview report retrieved successfully",
        interviewReport
    })

}

async function getAllInterviewReportsController(req,res){
    const interviewReports = await interviewReportModel.find({user: req.user.id}).sort({createdAt: -1}).select("-resume -selfDescription -jobDescription  -__v -technicalQuestions -behavioralQuestions -skillsGap -preparationPlan") 
    res.status(200).json({
        message: "Interview reports fetched successfully",
        interviewReports
    })
}

async function generateResumePdfController(req,res){
    try{

        const {interviewReportId}=req.params

    const interviewReport=await interviewReportModel.findById(interviewReportId)

    if(!interviewReport){
        return res.status(404).json({
            message:"Interview report not found"
        })
    }

    const {resume,selfDescription,jobDescription}=interviewReport


    const htmlContent=await generateResumePdf({
        resume,
        selfDescription,
        jobDescription
    });

    res.status(200).json({
        html:htmlContent
    });

    }catch(error){
        console.log("Resume HTML Error:",error.message);

        return res.status(500).json({
            message:"Failed to generate resume"
        });
    }

}



module.exports = {generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController}