import {RouterProvider} from "react-router"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import {router} from "./app.routes.jsx"
import {InterviewProvider} from "./features/auth/interview/interview.context.jsx"
function App() {
 

  return (
    <AuthProvider>
      <InterviewProvider>
        <RouterProvider router={router} />
      </InterviewProvider>
    </AuthProvider>
    
  )  
}

export default App
