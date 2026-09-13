import { useCallback, useState } from "react";

function generateChallenge() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { a, b, answer: a + b };
}

// A basic client-side "calculation" captcha to deter simple bots on the
// contact form. This is a UX deterrent, not real security — a determined
// script can read the answer out of React state same as it could the old
// jQuery closure variable. Real bot protection belongs server-side.
export default function useCaptcha() {
  const [challenge, setChallenge] = useState(generateChallenge);

  const refresh = useCallback(() => {
    setChallenge(generateChallenge());
  }, []);

  const verify = useCallback((value) => parseInt(value, 10) === challenge.answer, [challenge.answer]);

  return {
    question: `${challenge.a} + ${challenge.b}`,
    verify,
    refresh,
  };
}
