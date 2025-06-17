"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UUID } from "crypto";

type Problem = {
  id: number;
  problem_name: string;
  factors: JSON;
  user_id: UUID;
  created_at: Date;
  success: boolean;
};
type Factor = Record<string, string>;

export default function Home() {
  // Change problem input on text entry for submission to database
  const [problemInput, setProblemInput] = useState("");
  const [factorInput, setFactorInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [success, setSuccess] = useState(false);
  const [factors, setFactors] = useState<Factor[]>([]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setInput(e.target.value);
  };

  const handleProblemSubmit = async () => {
    if (!problemInput) {
      alert("Enter a problem title!");
      return;
    }
    const { error } = await supabase.from("attempts").insert([
      {
        problem_name: problemInput,
        factors: { [factorInput]: valueInput },
        success: success,
        created_at: new Date(),
      },
    ]);

    updateProblems();

    if (error) throw error;

    const problemInputElement = document.getElementById(
      "input-problem"
    ) as HTMLInputElement;
    const factorInputElement = document.getElementById(
      "input-factor"
    ) as HTMLInputElement;
    const valueInputElement = document.getElementById(
      "input-value"
    ) as HTMLInputElement;

    if (problemInputElement) {
      problemInputElement.value = "";
      setProblemInput("");
    }
    if (factorInputElement) {
      factorInputElement.value = "";
      setFactorInput("");
    }
    if (valueInputElement) {
      valueInputElement.value = "";
      setValueInput("");
    }
  };

  const handleFactorSubmit = async () => {
    if (!factors) {
      alert("Enter factors!");
      return;
    }

    const factorInputElement = document.getElementById(
      "input-factor"
    ) as HTMLInputElement;
    const valueInputElement = document.getElementById(
      "input-value"
    ) as HTMLInputElement;

    const factor = { [factorInput]: valueInput };

    if (factorInputElement) {
      factorInputElement.value = "";
      setFactorInput("");
    }
    if (valueInputElement) {
      valueInputElement.value = "";
      setValueInput("");
    }

    setFactors((prev) => [...prev, factor]);
  };

  const updateProblems = async () => {
    const { data, error } = await supabase.from("attempts").select("*");
    if (error) throw error;
    setProblems(data);
  };

  const getFormatTime = (dateString: Date | string) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };
  useEffect(() => {
    updateProblems();
  }, []);

  return (
    <>
      <div>
        {/* Problem input */}
        <h1>Welcome to Trial & Error!</h1>
        <p>Enter your problem below:</p>
        <div className="flex flex-grid gap-2">
          <input
            id="input-problem"
            type="text"
            className="border-1"
            placeholder="Your problem here..."
            onChange={(e) => handleChange(e, setProblemInput)}
          />
          <button
            id="button-problem-submit"
            className="border-1"
            onClick={handleProblemSubmit}
          >
            Submit Problem
          </button>
          <input
            id="input-factor"
            type="text"
            className="border-1"
            placeholder="Input factor here..."
            onChange={(e) => handleChange(e, setFactorInput)}
          />
          <input
            id="input-value"
            type="text"
            className="border-1"
            placeholder="Input value here..."
            onChange={(e) => handleChange(e, setValueInput)}
          />
          <button
            id="button-factor-submit"
            className="border-1"
            onClick={handleFactorSubmit}
          >
            Submit Factor
          </button>

          <button
            id="button-success"
            onClick={() => setSuccess((prev) => !prev)}
            className={"border-1 " + (success ? "bg-gray-400" : "bg-auto")}
          >
            Success
          </button>
        </div>

        {/* Factors list */}
        <div>
          {factors.map((factor, index) => {
            const key = Object.keys(factor)[0];
            const value = factor[key];

            return (
              <div key={index}>
                {key}: {value}
              </div>
            );
          })}
        </div>

        {/* Problems list */}
        <div>
          {problems.map((problem, index) => (
            <div key={index}>
              {problem.problem_name +
                " " +
                JSON.stringify(problem.factors) +
                " (created on " +
                getFormatTime(problem.created_at) +
                ") " +
                (problem.success ? "success" : "fail")}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
