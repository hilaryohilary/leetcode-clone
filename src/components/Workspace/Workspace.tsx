import React, { useState } from 'react';
import Split from 'react-split';
import ProblemDescription from './ProblemDescription/ProblemDescription';
import PlayGround from '../PlayGround/PlayGround';
import { Problem } from '@/utils/types/problem';
import Confetti from 'react-confetti';
import useWindowSize from '@/hooks/useWindowSize';
import { useRecoilValue } from 'recoil';
import { authModalState } from '@/atoms/authModalAtom';
import AuthModal from '../Modals/AuthModal';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/firebase';

type WorkspaceProps = {
    problem: Problem,
    setSuccess?: React.Dispatch<React.SetStateAction<boolean>>
};

const Workspace: React.FC<WorkspaceProps> = ({problem}) => {
    const { width, height } = useWindowSize();
    const [success, setSuccess] = useState(false);
    const [solved, setSolved] = useState(false);
    const authModal = useRecoilValue(authModalState);
    const [user] = useAuthState(auth);
    return (
        <>
            <Split className='split' minSize={0}>
                <ProblemDescription problem={problem} _solved={solved} />
                <PlayGround problem={problem} setSuccess={setSuccess} setSolved={setSolved} />
            </Split>
            {success && <Confetti gravity={0.3} tweenDuration={4000} width={width} height={height} />}
            {authModal.isOpen && !user && <AuthModal />}

        </>
    )
}
export default Workspace;