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
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Form has expired.</h1>
            <p className="py-6">
              Please contact Codex Devops if you think this is a mistake.
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <header className="bg-primary rounded-lg p-6 shadow-lg text-white">
        <h1 className="text-3xl font-bold">{form.title}</h1>
        <p className=" mt-2">{form.description}</p>
      </header>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <FormRenderer form={form} readonly={false} />
        </div>
      </div>
    </div>
  );
}
