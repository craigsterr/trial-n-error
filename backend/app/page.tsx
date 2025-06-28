"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UUID } from "crypto";

type Problem = {
  id: UUID;
  user_id: UUID;
  created_at: Date;
  name: string;
  description: string;
  success: boolean;
};

type Factor = {
  id: number;
  problem_id: UUID;
  created_at: Date;
  name: string;
  is_scale: boolean;
  value_binary: boolean;
  value_scale: number;
};

export default function Home() {
  // Change problem input on text entry for submission to database
  const [problemInput, setProblemInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [factorInput, setFactorInput] = useState("");
  const [scaleValue, setScaleValue] = useState(0);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [success, setSuccess] = useState(false);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem>();
  const [isScale, setIsScale] = useState(false);
  const [binaryValue, setBinaryValue] = useState(true);

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

    const { error } = await supabase.from("problems").insert([
      {
        name: problemInput,
        success: success,
        description: descriptionInput,
        created_at: new Date(),
      },
    ]);

    updateProblems();

    if (error) throw error;

    const problemInputElement = document.getElementById(
      "input-problem"
    ) as HTMLInputElement;
    const descriptionInputElement = document.getElementById(
      "input-description"
    ) as HTMLInputElement;

    if (problemInputElement) {
      problemInputElement.value = "";
      setProblemInput("");
    }
    if (descriptionInputElement) {
      descriptionInputElement.value = "";
      setFactorInput("");
    }
  };

  const handleProblemDelete = async () => {
    if (!selectedProblem) {
      alert("Select a problem to delete!");
      return;
    }

    const { error: problemError } = await supabase
      .from("problems")
      .delete()
      .eq("id", selectedProblem.id);

    const { error: factorError } = await supabase
      .from("factors")
      .delete()
      .eq("problem_id", selectedProblem.id);

    updateProblems();

    if (problemError) throw problemError;
    if (factorError) throw factorError;
  };

  const handleFactorSubmit = async () => {
    if (!factors) {
      alert("Enter factors!");
      return;
    }

    if (!selectedProblem) {
      alert("Select a problem for your factor!");
      return;
    }

    const factorInputElement = document.getElementById(
      "input-factor"
    ) as HTMLInputElement;
    const valueInputElement = document.getElementById(
      "input-value"
    ) as HTMLInputElement;

    const { error } = await supabase.from("factors").insert([
      {
        problem_id: selectedProblem.id,
        created_at: new Date(),
        name: factorInput,
        is_scale: isScale,
        value_binary: binaryValue,
        value_scale: scaleValue,
      },
    ]);

    if (error) throw error;

    updateFactors();

    if (factorInputElement) {
      factorInputElement.value = "";
      setFactorInput("");
    }
    if (valueInputElement) {
      valueInputElement.value = "";
      setScaleValue(0);
    }
  };

  const updateProblems = async () => {
    const { data, error } = await supabase.from("problems").select("*");
    if (error) throw error;
    setProblems(data);
  };

  const updateFactors = async () => {
    const { data, error } = await supabase.from("factors").select("*");
    if (error) throw error;
    setFactors(data);
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
    updateFactors();
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
          <input
            id="input-description"
            type="text"
            className="border-1"
            placeholder="Your description here..."
            onChange={(e) => handleChange(e, setDescriptionInput)}
          />
          <button
            id="button-success"
            onClick={() => setSuccess((prev) => !prev)}
            className={"border-1 " + (success ? "bg-gray-400" : "bg-auto")}
          >
            Success
          </button>
          <button
            id="button-problem-submit"
            className="border-1"
            onClick={handleProblemSubmit}
          >
            Submit Problem
          </button>
          <button
            id="button-problem-submit"
            className="border-1"
            onClick={handleProblemDelete}
          >
            Delete Problem
          </button>

          <input
            id="input-factor"
            type="text"
            className="border-1"
            placeholder="Input factor here..."
            onChange={(e) => handleChange(e, setFactorInput)}
          />
          {isScale && (
            <input
              id="input-value"
              className="border-1"
              placeholder="Input number here..."
              value={scaleValue}
              onChange={(e) => {
                const numValue = parseInt(
                  e.target.value.replace(/[^0-9]/g, "")
                );
                setScaleValue(numValue);
              }}
            />
          )}
          {!isScale && (
            <select name="select-binary" className="border-1 ">
              <option value="true" onClick={() => setBinaryValue(true)}>
                True
              </option>
              <option value="false" onClick={() => setBinaryValue(false)}>
                False
              </option>
            </select>
          )}
          <button
            id="button-success"
            onClick={() => setIsScale((prev) => !prev)}
            className={"border-1 "}
          >
            {isScale ? "Scale" : "Binary"}
          </button>
          <button
            id="button-factor-submit"
            className="border-1"
            onClick={handleFactorSubmit}
          >
            Submit Factor
          </button>
        </div>

        {/* Problems list */}
        <div>
          {problems.map((problem, index) => (
            <div
              key={index}
              className={
                "hover:bg-white/5 cursor-pointer text-amber-300 " +
                (problem == selectedProblem ? "bg-white/10" : "")
              }
              onClick={() => {
                if (problem == selectedProblem) setSelectedProblem(undefined);
                else setSelectedProblem(problem);
              }}
            >
              {problem.name +
                " (created on " +
                getFormatTime(problem.created_at) +
                ") " +
                (problem.success ? "(success)" : "(fail)")}
              {problem == selectedProblem && (
                <div className="opacity-50 text-orange-500">
                  {"Description: " + problem.description}
                </div>
              )}
              {problem == selectedProblem &&
                factors.map((factor, index) => {
                  if (factor.problem_id == problem.id) {
                    let value = factor.value_binary;
                    if (factor.is_scale) {
                      value = factor.value_scale;
                    }
                    return (
                      <div key={index} className="opacity-50 text-red-500">
                        {factor.name +
                          ": " +
                          value +
                          " (created on " +
                          getFormatTime(factor.created_at) +
                          ") "}
                      </div>
                    );
                  }
                })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
