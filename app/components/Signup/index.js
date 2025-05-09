import React, {useState} from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
// import Step2 from './Step2';
// import Step3 from './Step3';

const Signup = ({
  step1open,
  handleCloseStep1,
  setStep1open,
  moveToLogin,
  onCloseMenu,
}) => {
  const [step2open, setStep2open] = useState(false);
  const [step3open, setStep3open] = useState(false);
  const [step, setStep] = useState('1');
  const [formData, setFormData] = useState({});
  const [otpTimerData, setOtpTimerData] = useState({});

  const handleStep1 = data => {
    setFormData(data);
  };
  const handleStep2 = data => {
    setFormData(data);
  };

  const handleContinueStep2 = () => {
    setStep1open(false);
    setStep('2');
    setStep2open(true);
  };

  const handleContinueStep3 = () => {
    setStep('3');
    setStep3open(true);
  };

  const handleBackStep1 = () => {
    setStep2open(false);
    setStep('1');
    setStep1open(true);
  };

  const handleCloseStep3 = () => {
    setStep3open(false);
    onCloseMenu();
    setStep('1');
  };

  return (
    <>
      {step === '1' ? (
        <Step1
          handleStep1={handleStep1}
          step1open={step1open}
          handleCloseStep1={handleCloseStep1}
          handleContinueStep2={handleContinueStep2}
          moveToLogin={moveToLogin}
          setOtpTimerData={setOtpTimerData}
        />
      ) : step === '2' ? (
        <Step2
          handleStep2={handleStep2}
          formData={formData}
          step2open={step2open}
          handleCloseStep2={() => setStep2open(false)}
          handleBackStep1={handleBackStep1}
          handleContinueStep3={handleContinueStep3}
          setOtpTimerData={setOtpTimerData}
          otpTimerData={otpTimerData}
          setStep2open={setStep2open}
        />
      ) : (
        <Step3 step3open={step3open} handleCloseStep3={handleCloseStep3} />
      )}
    </>
  );
};

export default Signup;
