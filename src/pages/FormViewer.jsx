import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import { useAuthStore } from "../stores/authStore";
import FormRenderer from "../components/FormRenderer";
import LoadingScreen from "../components/LoadingScreen";

export default function FormViewer() {
  const { id } = useParams();
  const hrProfile = useAuthStore((state) => state.hrProfile);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchForm = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading form:", error.message);
        setForm(null);
      } else {
        if (!data?.is_published) {
          setForm(null);
        } else {
          setForm(data);
        }
      }

      setLoading(false);
    };

    fetchForm();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingScreen/>
      </div>
    );

  if (!form)
    return (
      <div className="hero bg-base-200 min-h-screen">
        <div className="hero-content text-center">
          <div className="flex max-w-md">
            <div>
              <img src="/BrunForms-Logo.png" alt="Logo" />
            </div>
            <div className="ml-4">            
              <h1 className="pt-8.5 text-5xl font-bold text-left">Form has expired.</h1>
              <p className="pt-6 text-left">
                Please contact <a href="brunfjell.github.io/brunfjell-portfolio" className="text-primary">Support Team</a> if you think this is a mistake.
              </p>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <header className="flex bg-secondary rounded-lg p-6 shadow-lg text-white">
        <div>
          <img src="/BrunForms-Logo.png" alt="logo" className="h-18 w-18 mr-4 shadow-lg"/>
        </div>
        <div>
          <h1 className="text-3xl font-bold">{form.title}</h1>
          <p>{form.description}</p>
          <p className="text-xs">Already submitted a form? check your status <a href="/status" className="text-[#e6f29d]">here</a></p>
        </div>
      </header>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <FormRenderer form={form} readonly={false} />
        </div>
      </div>
    </div>
  );
}
