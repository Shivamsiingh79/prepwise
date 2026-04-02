
import React from 'react';
import {useNavigate,Link} from "react-router";
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const Login = () => {

    const {loading,handleLogin}=useAuth()
    const navigate=useNavigate()
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [error,setError]=useState(null);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            setError(null);
            await handleLogin({email,password});
            navigate("/home");
        }catch(error){
            setError(error.message);
        }
    };

    if(loading){
        return (<main><h1>Loading.....</h1></main>)
    }

    return (
    <main>
        <div className="form-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                {error && <p className='error-text'>{error}</p>}
               <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        onChange={(e)=>{setEmail(e.target.value)}}
                        type="email"  id="email" name="email" placeholder='Enter email address'/>
                </div> 

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        onChange={(e)=>{setPassword(e.target.value)}}
                        type="password"  id="password" name="password" placeholder='Enter password'/>
                </div>

                <button className='button primary-button'>Login</button>
            </form>

             <p>Don't have an account? <Link to={"/register"}>Register</Link></p>
        </div>
    </main>
  );
};

export default Login;
