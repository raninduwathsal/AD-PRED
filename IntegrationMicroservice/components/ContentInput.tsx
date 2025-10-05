import React, { useState, useCallback } from 'react';
import { GenerateInput } from '../App';

interface ContentInputProps {
    onGenerate: (input: GenerateInput) => void;
    disabled: boolean;
}

const ContentInput: React.FC<ContentInputProps> = ({ onGenerate, disabled }) => {
    const [topic, setTopic] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);

    const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTopic(e.target.value);
        if (file) setFile(null); // Clear file if user starts typing a topic
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            if (topic) setTopic(''); // Clear topic if user selects a file
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            onGenerate({ topic });
        } else if (file) {
            onGenerate({ file });
        }
    };

    return (
        <section className="bg-white p-6 rounded-2xl shadow-lg animate-pop-in">
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="topic-input" className="block text-xl font-semibold mb-3 text-slate-700">
                        Generate from a Topic
                    </label>
                    <p className="text-slate-500 mb-4">
                        Enter a subject, and the AI will create quiz questions about it.
                    </p>
                    <input
                        id="topic-input"
                        type="text"
                        value={topic}
                        onChange={handleTopicChange}
                        placeholder="e.g., Basics of Computer Networking"
                        className="w-full p-4 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300"
                        disabled={disabled}
                    />
                </div>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-slate-300"></div>
                    <span className="flex-shrink mx-4 text-slate-500 font-semibold">OR</span>
                    <div className="flex-grow border-t border-slate-300"></div>
                </div>

                <div>
                     <label htmlFor="file-upload" className="block text-xl font-semibold mb-3 text-slate-700">
                        Generate from a File
                    </label>
                     <p className="text-slate-500 mb-4">
                        Upload a document (PDF, CSV), and the AI will analyze its content.
                    </p>
                    <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-slate-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.csv" disabled={disabled} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-slate-500">PDF, CSV up to 10MB</p>
                        </div>
                    </div>
                     {file && (
                        <p className="mt-2 text-center text-sm font-medium text-green-700">
                            Selected: {file.name}
                        </p>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <button
                        type="submit"
                        disabled={disabled || (!topic.trim() && !file)}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        ✨ Generate Questions
                    </button>
                </div>
            </form>
        </section>
    );
};

export default ContentInput;