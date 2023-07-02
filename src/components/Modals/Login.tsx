import { authModalState } from '@/atoms/authModalAtom';
import { useSetRecoilState } from 'recoil';
import React, { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebase';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import router from 'next/router';
import { toast } from 'react-toastify';

type LoginProps = {

};

const Login: React.FC<LoginProps> = () => {
    const setAuthModalState = useSetRecoilState(authModalState)
    const handleClick = (type: "login" | "register" | "forgotPassword") => {
        setAuthModalState((prev) => ({ ...prev, type }));
    };

    const [inputs, setInputs] = useState({ email: "", password: "" });

    const [
        signInWithEmailAndPassword,
        user,
        loading,
        error,
    ] = useSignInWithEmailAndPassword(auth);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputs.email || !inputs.password) return toast.error("Please fill all fields", { position: "top-center", autoClose: 3000, theme: "dark" });;
        try {
            const user = await signInWithEmailAndPassword(inputs.email, inputs.password);
            if (!user) return;
            await router.push('/');
            toast.success(`Welcome ${user.user.email}`, { position: "top-left", autoClose: 1000, theme: "dark" })
        } catch (error: any) {
            toast.error(error.message, { position: "top-center", autoClose: 3000, theme: "dark" });
        }
    };

    useEffect(() => {
        if (error) toast.error(error.message, {position: "top-center", autoClose: 1000, theme: "dark"});
    }, [error])
    

    return (
        <form className='space-y-6 px-6 py-4' onSubmit={handleLogin}>
            <h3 className="text-xl font-medium text-white">
                Sign in to LeetClone
            </h3>
            <div>
                <label htmlFor="email" className='text-sm font-medium block mb-2 text-gray-300'> Your Email</label>
                <input onChange={handleInputChange} type="email" name="email" id="email" className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white' placeholder='name@company.com' />
            </div>
            <div>
                <label htmlFor="password" className='text-sm font-medium block mb-2 text-gray-300'> Your Password</label>
                <input onChange={handleInputChange} type="password" name="password" id="password" className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white' placeholder='********' />
            </div>
            <div>
                <button type="submit" className='w-full text-white focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s'> { loading ? "Loading...": "Login"} </button>
            </div>
            <div>
                <button className="flex w-full justify-end">
                    <a href="#" className="text-sm block text-brand-orange hover:underline w-full text-right" onClick={() => handleClick('forgotPassword')}>
                        Forgot Password?
                    </a>
                </button>
            </div>

            <div className='text-sm block font-medium text-gray-300 hover:underline'>
                Not Registered {" "}
                <a href="#" className='text-blue-700 hover:underline' onClick={() => handleClick('register')}>Create account</a>
            </div>
        </form>
    )
}
export default Login;