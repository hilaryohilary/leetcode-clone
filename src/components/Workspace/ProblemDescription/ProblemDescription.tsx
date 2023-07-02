import CircleSkeleton from '@/components/skeletons/CircleSkeleton';
import RectangleSkeleton from '@/components/skeletons/RectangleSkeleton';
import { auth, firestore } from '@/firebase/firebase';
import { DBProblem, Problem } from '@/utils/types/problem';
import { Transaction, arrayRemove, arrayUnion, doc, getDoc, runTransaction, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { AiFillDislike, AiFillLike, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BsCheck2Circle } from 'react-icons/bs';
import { TiStarFullOutline, TiStarOutline } from 'react-icons/ti';
import { toast } from 'react-toastify';
type ProblemDescriptionProps = {
    problem: Problem,
    _solved: boolean
};

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ problem, _solved }) => {

    const { currentProblem, problemDifficultyClass, loading, setcurrentProblem } = useGetCurrentProblem(problem.id);
    const { liked, disliked, starred, solved, setdata } = useGetUsersDataOnProblem(problem.id);
    const [user] = useAuthState(auth);
    const [updating, setUpdating] = useState(false);

    const returnUserandProblemData = async (transaction: Transaction) => {
        const problemRef = doc(firestore, "problems", problem.id);
        const userRef = doc(firestore, "users", user!.uid);
        const userDoc = await transaction.get(userRef);
        const problemDoc = await transaction.get(problemRef);
        return { userDoc, problemDoc, userRef, problemRef };
    }

    const handleLike = async () => {
        if (!user) {
            toast.error('You must be logged in to like a problem', { position: "top-left", theme: "dark" });
            return;
        }
        if (updating) return;
        setUpdating(true);
        await runTransaction(firestore, async (transaction) => {
            const { userDoc, problemDoc, userRef, problemRef } = await returnUserandProblemData(transaction);
            if (userDoc.exists() && problemDoc.exists()) {
                if (liked) {
                    //remove problemId from user's likedProblem array
                    transaction.update(userRef, { likedProblems: userDoc.data().likedProblems.filter((id: string) => id !== problem.id) });
                    transaction.update(problemRef, {
                        likes: problemDoc.data().likes - 1,
                    })
                    setcurrentProblem(prev => prev ? (({ ...prev, likes: prev.likes - 1 })) : null);
                    setdata(prev => ({ ...prev, liked: false }));
                } else if (disliked) {
                    transaction.update(userRef, {
                        likedProblems: [...userDoc.data().likedProblems, problem.id],
                        dislikedProblems: userDoc.data().dislikedProblems.filter((id: string) => id !== problem.id)

                    })
                    transaction.update(problemRef, {
                        likes: problemDoc.data().likes + 1,
                        dislikes: problemDoc.data().dislikes - 1
                    })
                    setcurrentProblem(prev => prev ? ({ ...prev, likes: prev?.likes + 1, dislikes: prev?.dislikes - 1 }) : null);
                    setdata(prev => ({ ...prev, liked: true, disliked: false }));
                } else {
                    transaction.update(userRef, {
                        likedProblems: [...userDoc.data().likedProblems, problem.id]
                    })
                    transaction.update(problemRef, ({
                        likes: problemDoc.data().likes + 1
                    }))
                    setcurrentProblem(prev => prev ? ({
                        ...prev, likes: prev?.likes + 1
                    }) : null)
                    setdata(prev => ({
                        ...prev, liked: true
                    }))
                }
            }

        });
        setUpdating(false);
    }

    const handleDisLike = async () => {
        if (!user) {
            toast.error('You must be logged in to dislike a problem', { position: "top-left", theme: "dark" });
            return;
        }
        if (updating) return;
        setUpdating(true);
        await runTransaction(firestore, async (transaction) => {
            const { userDoc, problemDoc, userRef, problemRef } = await returnUserandProblemData(transaction);
            if (userDoc.exists() && problemDoc.exists()) {
                if (liked) {
                    //remove problemId from user's likedProblem array
                    transaction.update(userRef, {
                        likedProblems: userDoc.data().likedProblems.filter((id: string) => id !== problem.id),
                        dislikedProblems: [...userDoc.data().dislikedProblems, problem.id]
                    });
                    transaction.update(problemRef, {
                        likes: problemDoc.data().likes - 1,
                        dislikes: problemDoc.data().dislikes + 1
                    })

                    setcurrentProblem(prev => prev ? (({ ...prev, likes: prev.likes - 1, dislikes: prev?.dislikes + 1 })) : null);
                    setdata(prev => ({ ...prev, liked: false, disliked: true }));
                } else if (disliked) {
                    transaction.update(userRef, {
                        dislikedProblems: userDoc.data().dislikedProblems.filter((id: string) => id !== problem.id)

                    })
                    transaction.update(problemRef, {
                        dislikes: problemDoc.data().dislikes - 1
                    })
                    setcurrentProblem(prev => prev ? ({ ...prev, dislikes: prev?.dislikes - 1 }) : null);
                    setdata(prev => ({ ...prev, disliked: false }));
                } else {
                    transaction.update(userRef, {
                        dislikedProblems: [...userDoc.data().dislikedProblems, problem.id]
                    })
                    transaction.update(problemRef, ({
                        dislikes: problemDoc.data().dislikes + 1
                    }))
                    setcurrentProblem(prev => prev ? ({
                        ...prev, dislikes: prev?.dislikes + 1
                    }) : null)
                    setdata(prev => ({
                        ...prev, disliked: true
                    }))
                }
            }

        });
        setUpdating(false);
    }

    const handleStarred = async () => {
        if (!user) {
            toast.error('You must be logged in to star a problem', { position: "top-left", theme: "dark" });
            return;
        }
        if (updating) return;
        setUpdating(true);
        const userRef = doc(firestore, "users", user.uid);
        if (!starred) {
            await updateDoc(userRef, {
                starredProblems: arrayUnion(problem.id)

            });
            setdata(prev => ({ ...prev, starred: true }));
        } else {

            await updateDoc(userRef, {
                starredProblems: arrayRemove(problem.id),
            })
            setdata(prev => ({ ...prev, starred: false }));

            setUpdating(false);
        }
    }

    return (
        <div className='bg-dark-layer-1'>
            {/* TAB */}
            <div className='flex h-11 w-full items-center pt-2 bg-dark-layer-2 text-white overflow-x-hidden'>
                <div className={"bg-dark-layer-1 rounded-t-[5px] px-5 py-[10px] text-xs cursor-pointer"}>
                    Description
                </div>
            </div>

            <div className='flex px-0 py-4 h-[calc(100vh-94px)] overflow-y-auto'>
                <div className='px-5'>
                    {/* Problem heading */}
                    <div className='w-full'>
                        <div className='flex space-x-4'>
                            <div className='flex-1 mr-2 text-lg text-white font-medium'>{problem.title}</div>
                        </div>
                        {!loading && currentProblem && (
                            <div className='flex items-center mt-3'>
                                <div
                                    className={`${problemDifficultyClass} inline-block rounded-[21px] bg-opacity-[.15] px-2.5 py-1 text-xs font-medium capitalize `}
                                >
                                    {currentProblem.difficulty}
                                </div>
                                {(solved || _solved) && (
                                    <div className='rounded p-[3px] ml-4 text-lg transition-colors duration-200 text-green-s text-dark-green-s'>
                                        <BsCheck2Circle />
                                    </div>
                                )}
                                <div className='flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px]  ml-4 text-lg transition-colors duration-200 text-dark-gray-6' onClick={handleLike}>
                                    {liked && !updating && <AiFillLike className='text-dark-blue-s' />}
                                    {!liked && !updating && <AiFillLike />}
                                    {updating && <AiOutlineLoading3Quarters className='animate-spin' />}
                                    {!updating && (
                                        <span className='text-xs'>{currentProblem.likes}</span>
                                    )}

                                </div>
                                <div className='flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px]  ml-4 text-lg transition-colors duration-200 text-green-s text-dark-gray-6' onClick={handleDisLike}>
                                    {disliked && !updating && <AiFillDislike className='text-dark-blue-s' />}
                                    {!disliked && !updating && <AiFillDislike />}
                                    {updating && <AiOutlineLoading3Quarters className='animate-spin' />}

                                    {!updating && <span className='text-xs'>{currentProblem.dislikes}</span>}
                                </div>
                                <div onClick={handleStarred} className='cursor-pointer hover:bg-dark-fill-3  rounded p-[3px]  ml-4 text-xl transition-colors duration-200 text-green-s text-dark-gray-6 '>
                                    {starred && !updating && <TiStarFullOutline className=' text-dark-yellow' />}
                                    {!starred && !updating && <TiStarOutline />}
                                    {updating && <AiOutlineLoading3Quarters className='animate-spin' />}


                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className='mt-3 flex space-x-2'>
                                <RectangleSkeleton />
                                <CircleSkeleton />
                                <RectangleSkeleton />
                                <RectangleSkeleton />
                                <CircleSkeleton />

                            </div>
                        )}

                        {/* Problem Statement(paragraphs) */}
                        <div className='text-white text-sm'>
                            <div dangerouslySetInnerHTML={{ __html: problem.problemStatement }} />
                        </div>

                        {/* Examples */}
                        <div className='mt-4'>
                            {problem.examples.map((example, index) => (
                                <div key={example.id}>
                                    <p className="font-medium text-white">
                                        Example {index + 1}:
                                    </p>
                                    {example.img && (
                                        <img src={example.img} alt="" className='mt-3' />
                                    )}
                                    <div className="example-card">
                                        <pre>
                                            <strong className='text-white'>Input: </strong> {example.inputText}
                                            <br />
                                            <strong>Output: </strong> {example.outputText}
                                            <br />
                                            {
                                                example.explanation && (
                                                    <>
                                                        <strong>Explanation: </strong> {example.explanation}
                                                    </>

                                                )
                                            }
                                        </pre>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Constraints */}
                        <div className='my-8 pb-4'>
                            <div className='text-white text-sm font-medium'>Constraints:</div>
                            <ul className='text-white ml-5 list-disc'>
                                <div dangerouslySetInnerHTML={{ __html: problem.constraints }} />
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ProblemDescription;

function useGetCurrentProblem(problemId: string) {
    const [currentProblem, setcurrentProblem] = useState<DBProblem | null>(null);
    const [loading, setloading] = useState<boolean>(true)
    const [problemDifficultyClass, setproblemDifficultyClass] = useState<string>("");
    useEffect(() => {
        const getCurrentProblem = async () => {
            setloading(true);
            const docRef = (doc(firestore, "problems", problemId));
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const problem = docSnap.data();
                setcurrentProblem({ id: docSnap.id, ...problem } as DBProblem);
                setproblemDifficultyClass(
                    problem.difficulty === "Easy" ? "bg-olive text-olive" : problem.difficulty === "Medium" ? "bg-yellow text-dark-yellow" : "bg-dark-pink text-dark-pink"
                );
            }
            setloading(false);
        };
        getCurrentProblem();
    }, [problemId])

    return { currentProblem, problemDifficultyClass, loading, setcurrentProblem };

}

function useGetUsersDataOnProblem(problemId: string) {
    const [user] = useAuthState(auth);
    const [data, setdata] = useState({ liked: false, disliked: false, starred: false, solved: false });

    useEffect(() => {
        const getUsersDataOnProblem = async () => {
            const userRef = (doc(firestore, "users", user?.uid as string));
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                const { solvedProblems, likedProblems, starredProblems, dislikedProblems } = data;
                setdata({
                    liked: likedProblems.includes(problemId),
                    disliked: dislikedProblems.includes(problemId),
                    starred: starredProblems.includes(problemId),
                    solved: solvedProblems.includes(problemId)
                });
            }

        };
        if (user) getUsersDataOnProblem();
        return () => setdata({ liked: false, disliked: false, starred: false, solved: false })
    }, [problemId, user])
    return { ...data, setdata };
}