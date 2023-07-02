import Head from 'next/head'
import { Inter } from 'next/font/google'
import Topbar from '@/components/Topbar/Topbar'
import ProblemsTables from '@/components/ProblemTables/ProblemsTables'
import { useState } from 'react'
import { useHasMounted } from '@/hooks/useHasMounted'
// import { doc, setDoc } from 'firebase/firestore'
// import { firestore } from '@/firebase/firebase'
// import { toast } from 'react-toastify'
// import { problems } from '@/mockProblems/problems'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  // const [inputs, setInputs] = useState({
  //   id: "",
  //   title: "",
  //   difficulty: "",
  //   category: "",
  //   videoId: "",
  //   link: "",
  //   order: 0,
  //   likes: 0,
  //   dislikes: 0
  // });
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setInputs({ ...inputs, [e.target.name]: e.target.value });
  // }
  // console.log(inputs)

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   //convert inputs.order to integer
  //   const newProblem = {
  //     ...inputs,
  //     order: Number(inputs.order),
  //     likes: Number(inputs.likes),
  //     dislikes: Number(inputs.dislikes),
  //   }
  //   await setDoc(doc(firestore, "problems", inputs.id), newProblem);
  //   toast.success(`${inputs.title} saved`);
    
  // }

  // const saveDocs = () => {
  //   let i = 4;
  //   const remainingProblems = [];
  //   for (i; i < problems.length; i++) {
  //     remainingProblems.push(problems[i]);
  //   }
  //  const Dbproblems = remainingProblems.map((problem) => {
  //     const problemtoSave = {
  //       ...problem,
  //       title: `${problem.order}. ${problem.title}`,
  //       order: 0,
  //       likes: 0,
  //       dislikes: 0,
  //       link: ""
  //     }
  //     return problemtoSave;
  //  });
  //   console.log(Dbproblems);
  //   Dbproblems.forEach(async(problem) => {
  //     await setDoc(doc(firestore, "problems", problem.id), problem);
  //     toast.success(`${problem.id} saved!`);
  //   })
  // }
  const [loadingProblems, setloadingProblems] = useState(true);
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>LeetCodeClone</title>
        <meta name="description" content="LeetCode clone by Hilary.O.Hilary" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <main className='bg-dark-layer-2 min-h-screen'>
        <Topbar />
        <h1
          className='text-2xl text-center text-gray-700 dark:text-gray-400 font-medium uppercase mt-10 mb-5'>
          &ldquo; QUALITY OVER QUANTITY &rdquo; 👇
        </h1>
        {loadingProblems && (
          <div className="max-w-[1200px] mx-auto sm:w-7/12  w-full animate-pulse">
            {[...Array(10)].map((_, idx) => (
            <LoadingSkeleton key={idx}/>
            ))}
          </div>
        )}
        <div className='relative overflow-x-auto mx-auto px-6 pb-10'>
          <table className='text-sm text-left text-gray-500 dark:text-gray-400 sm:w-7/12 w-full max-w-[1200px] mx-auto'>
            {!loadingProblems && (
              <thead className='text-xs text-gray-700 uppercase dark:text-gray-400 border-b '>
                <tr>
                  <th scope='col' className='px-1 py-3 w-0 font-medium'>
                    Status
                  </th>
                  <th scope='col' className='px-6 py-3 w-0 font-medium'>
                    Title
                  </th>
                  <th scope='col' className='px-6 py-3 w-0 font-medium'>
                    Difficulty
                  </th>

                  <th scope='col' className='px-6 py-3 w-0 font-medium'>
                    Category
                  </th>
                  <th scope='col' className='px-6 py-3 w-0 font-medium'>
                    Solution
                  </th>
                </tr>
              </thead>
            )}
            <ProblemsTables setLoadingProblems={setloadingProblems } />
          </table>
        </div> 

        {/* temp form  */}
        {/* <form className='p-0 flex flex-col max-w-sm gap-3'>
          <input onChange={handleInputChange} type="text" name="id" id="id" placeholder='id' />
          <input onChange={handleInputChange} type="text" name="title" id="title" placeholder='title' />
          <input onChange={handleInputChange} type="text" name="difficulty" id="difficulty" placeholder='difficulty' />
          <input onChange={handleInputChange} type="text" name="category" id="category" placeholder='category' />
          <input onChange={handleInputChange} type="text" name="order" id="order" placeholder='order' />
          <input onChange={handleInputChange} type="text" name="videoId" id="videoId" placeholder='videoId' />
          <input onChange={handleInputChange} type="text" name="link" id="link" placeholder='link?' />
          <button className='bg-white' onClick={(e) => {
            e.preventDefault();
            saveDocs();
          }}>Save to Firestore</button>
        </form> */}
      </main>
    </>
  )
}

const LoadingSkeleton = () => {
  return (
    <div className='flex items-center space-x-12 mt-4 px-6'>
      <div className='w-6 h-6 shrink-0 rounded-full bg-dark-layer-1'></div>
      <div className='h-4 sm:w-52  w-32  rounded-full bg-dark-layer-1'></div>
      <div className='h-4 sm:w-52  w-32 rounded-full bg-dark-layer-1'></div>
      <div className='h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1'></div>
      <span className='sr-only'>Loading...</span>
    </div>
  );
};