import Link from 'next/link';
import React, { SetStateAction, useEffect, useState } from 'react';
import { BsCheckCircle } from 'react-icons/bs';
import { AiFillYoutube } from 'react-icons/ai'
import { IoClose } from 'react-icons/io5';
import YouTube from 'react-youtube';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { firestore } from '@/firebase/firebase';
import { DBProblem } from '@/utils/types/problem';
import useSolvedProblems from '@/hooks/useSolvedProblems';

type ProblemsTablesProps = {
    setLoadingProblems: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProblemsTables: React.FC<ProblemsTablesProps> = ({setLoadingProblems}) => {
    const [youtubePlayer, setYoutubePlayer] = useState({
        isOpen: false,
        videoId: ''
    })

    const handleVideo = (videoId: string | undefined) => {
        if (videoId) return setYoutubePlayer({ videoId: videoId, isOpen: true });
    };

    const handleCloseVideo = () => {
        setYoutubePlayer({ isOpen: false, videoId: '' });
    }

    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") handleCloseVideo();
    }
    useEffect(() => {
      window.addEventListener("keydown",handleEsc)
    
      return () => {
        window.removeEventListener("keydown", handleEsc)
      }
    }, [])
    
    const problems = useGetProblems(setLoadingProblems);
    const solvedProblems = useSolvedProblems();
    console.log(solvedProblems);
    return (
        <>
            <tbody className='text-white'>
                {problems.map((doc, idx) => {
                    const difficultyColor = doc.difficulty === 'Easy' ? 'text-dark-green-s' : doc.difficulty === 'Medium' ? 'text-dark-yellow' : "text-dark-pink";

                    return (
                        <tr className={`${idx % 2 == 1 ? 'bg-dark-layer-1' : ''}`} key={doc.id}>
                            <th className="px-2 py-4 font-medium whitespace-nowrap text-dark-green-s">
                                {
                                    solvedProblems.includes(doc.id) &&
                                    <BsCheckCircle fontSize={"28"} width="18" />
                                }
                            </th>
                            <td className='px-6 py-4'>
                                {doc.link === "" ? (
                                    <Link className="hover:text-blue-600 cursor-pointer" href={`/problems/${doc.id}`}>
                                        {doc.title}
                                    </Link>
                                ) : (
                                        <Link className="hover:text-blue-600 cursor-pointer" href={doc.link as string} target='__blank'> { doc.title}
                                        </Link>
                                )}
                            </td>
                            <td className={`px-6 py-4 ${difficultyColor}`}>
                                {doc.difficulty}
                            </td>
                            <td className={'px-6 py-4'}>
                                {doc.category}
                            </td>
                            <td className={'px-6 py-4'}>
                                {
                                    doc.videoId ? (<AiFillYoutube fontSize={18} className='cursor-pointer hover:text-red-500'
                                        onClick={() => handleVideo(doc.videoId)}
                                    />) : (<p className='text-gray-400'> Coming soon</p>)
                                }
                            </td>
                        </tr>
                    )
                })}
            </tbody>
            {youtubePlayer.isOpen && (<tfoot className='fixed top-0 left-0 h-screen w-screen flex items-center justify-center ' >
                <div className='bg-black z-10 opacity-70 top-0 left-0 w-screen h-screen absolute' onClick={handleCloseVideo} ></div>
                <div className='w-full z-50 h-full px-6 relative max-w-4xl'>
                    <div className='w-full h-full flex items-center justify-center relative'>
                        <div className='w-full relative'>
                            <IoClose fontSize={"35"} className='cursor-pointer absolute -top-16 right-0' onClick={handleCloseVideo} />
                            <YouTube videoId={`${youtubePlayer.videoId}`} loading='lazy' iframeClassName='w-full min-h-[500px]' />
                        </div>
                    </div>
                </div>
            </tfoot>)}
        </>

    )
}
export default ProblemsTables;

function useGetProblems(setLoadingProblems: React.Dispatch<SetStateAction<boolean>>) {
    const [problems, setproblems] = useState<DBProblem[]>([]);
    useEffect(() => {
        const getProblems = async () => {
            setLoadingProblems(true);
            const q = query(collection(firestore, "problems"), orderBy("order", "asc"));
            const querySnapshot = await getDocs(q);
            const tmp:DBProblem[] = [];
            querySnapshot.forEach((doc) => {
                tmp.push({id: doc.id, ...doc.data()} as DBProblem)
            })
            setproblems(tmp);
            setLoadingProblems(false);
        }
        getProblems();
    }, []);
    
    return problems;
}