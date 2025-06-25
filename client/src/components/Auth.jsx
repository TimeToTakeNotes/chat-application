import React, { useState } from 'react';
import axios from 'axios';

import signinImage from '../assets/signup.jpg';

const URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const initialState = {
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    emailAddress: '',
    avatarURL: '',
}

const Auth = () => {
    const [form, setForm] = useState(initialState);
    const [isSignup, setIsSignup] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (isSignup && form.password !== form.confirmPassword) {
            setErrorMessage("Passwords do not match.");

            setForm((prevForm) => ({
                ...prevForm,
                password: '',
                confirmPassword: '',
            }));

            setSubmitting(false);
            return;
        }

        const { username, emailAddress, avatarURL, password, confirmPassword } = form;

        try {
            const requesBody = {
                fullName: form.fullName,
                username,
                emailAddress,
                password,
                confirmPassword,
                ...(avatarURL && { avatarURL }) // Include only if not empty
            };

            await axios.post(`${URL}/auth/${isSignup ? 'signup' : 'login'}`, requesBody, {
                withCredentials: true // to allow cookies to be set
            });

            setSubmitting(false);
            window.location.reload();
        } catch (err) {
            console.error('Authentication error:', err.response?.data?.message || err.message);
            setErrorMessage(err.response?.data?.message || 'Login failed.');
            setSubmitting(false);
        }
    };

    const switchMode = () => {
        setIsSignup((prevIsSignup) => !prevIsSignup);
        setErrorMessage('');
        setForm(initialState);
    }

    return (
        <div className="auth__form-container">
            <div className="auth__form-container_fields">
                <div className="auth__form-container_fields-content">
                    <p>{isSignup ? 'Sign Up' : 'Sign In'}</p>
                    <form onSubmit={handleSubmit}>
                        {isSignup && (
                            <div className="auth__form-container_fields-content_input">
                                <label htmlFor="fullName">Full Name</label>
                                <input 
                                    name="fullName" 
                                    type="text"
                                    placeholder="Full Name"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}
                        <div className="auth__form-container_fields-content_input">
                            <label htmlFor="username">Username</label>
                                <input 
                                    name="username" 
                                    type="text"
                                    placeholder="Username"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        {isSignup && (
                            <div className="auth__form-container_fields-content_input">
                                <label htmlFor="emailAddress">Email Address</label>
                                <input 
                                    name="emailAddress" 
                                    type="email"
                                    placeholder="Email Address"
                                    value={form.emailAddress}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}
                        <div className="auth__form-container_fields-content_input">
                                <label htmlFor="password">Password</label>
                                <input 
                                    name="password" 
                                    type="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        {isSignup && (
                            <div className="auth__form-container_fields-content_input">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input 
                                    name="confirmPassword" 
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            )}
                        <div className="auth__form-container_fields-content_button">
                            <button disabled={submitting}>
                                {submitting ? "Please wait..." : isSignup ? "Sign Up" : "Sign In"}
                            </button>
                        </div>
                    </form>
                    {errorMessage && <p className="auth__form-error-message">{errorMessage}</p>}
                    <div className="auth__form-container_fields-account">
                        <p>
                            {isSignup
                             ? "Already have an account?" 
                             : "Don't have an account?"
                             }
                             <span onClick={switchMode}>
                             {isSignup ? 'Sign In' : 'Sign Up'}
                             </span>
                        </p>
                    </div>
                </div> 
            </div>
            <div className="auth__form-container_image">
                <img src={signinImage} alt="sign in" />
            </div>
        </div>
    )
}

export default Auth