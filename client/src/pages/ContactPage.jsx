
import { useForm } from 'react-hook-form';
import {
  Mail,
  MessageSquare,
  Send,
  Phone,
  UserRound,
  Linkedin,
  Github,
} from 'lucide-react';

import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import { useToast } from '../hooks/useToast.js';
import { contactApi } from '../services/contactApi.js';
import { emailPattern, nameRules } from '../utils/validators.js';

export default function ContactPage() {
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  async function onSubmit(values) {
    try {
      await contactApi.submit(values);
      toast.success("Message sent — we'll get back to you soon.");
      reset();
    } catch (err) {
      setError('root', {
        message:
          err?.response?.data?.error?.message ||
          'Could not send your message. Please try again.',
      });
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">

      {/* Page Heading */}
      <div className="text-center max-w-xl mx-auto mb-14 animate-fade-up">
        <span className="chip border-aqua-400/30 text-aqua-300 mb-6 mx-auto w-fit">
          Contact
        </span>

        <h1 className="text-4xl font-display font-semibold tracking-tight mb-4">
          Talk to us
        </h1>

        <p className="text-ink_text-muted">
          Questions, feedback, or something not working right?
          Send a message and we'll respond personally.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">

        {/* Contact Information */}
        <Card className="md:col-span-2 flex flex-col justify-between">

          <div>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-aqua-500/10 text-violet-300 mb-4">
              <UserRound className="h-5 w-5" />
            </span>

            <h3 className="font-display font-semibold mb-2">
              Project Developer
            </h3>

            <p className="text-sm text-ink_text-primary font-medium mb-5">
              Sandeep Narlapuram
            </p>

            {/* Email */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-violet-300" />
                <span className="text-sm font-medium">Email</span>
              </div>

              <a
                href="mailto:sandeepnarlapuram@gmail.com"
                className="text-sm text-ink_text-muted hover:text-aqua-300 transition-colors break-all"
              >
                sandeepnarlapuram@gmail.com
              </a>
            </div>

            {/* Phone */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-violet-300" />
                <span className="text-sm font-medium">Phone</span>
              </div>

              <a
                href="tel:+917569839923"
                className="text-sm text-ink_text-muted hover:text-aqua-300 transition-colors"
              >
                +91 7569839923
              </a>
            </div>

            {/* Social Profiles */}
            <div className="border-t border-white/10 pt-5">

              <h3 className="font-display font-semibold mb-4">
                Connect with me
              </h3>

              <div className="flex items-center gap-4">

                <a
                  href="https://www.linkedin.com/in/sandeep-narlapuram-58b7a0332/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  title="LinkedIn"
                  className="flex items-center justify-center h-11 w-11 rounded-xl bg-white/[0.04] border border-white/10 text-ink_text-muted hover:text-blue-400 hover:border-blue-400/40 hover:bg-blue-500/10 transition-all"
                >
                  <Linkedin className="h-5 w-5" />
                </a>

                <a
                  href="https://github.com/Sandeep-Narlapuram"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  title="GitHub"
                  className="flex items-center justify-center h-11 w-11 rounded-xl bg-white/[0.04] border border-white/10 text-ink_text-muted hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
                >
                  <Github className="h-5 w-5" />
                </a>

              </div>
            </div>

            <p className="text-xs text-ink_text-faint mt-5 leading-relaxed">
              Feel free to reach out for project-related queries,
              technical support, or suggestions.
            </p>
          </div>

          {/* Feedback */}
          <div className="mt-8 pt-6 border-t border-white/10">

            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-aqua-500/10 text-violet-300 mb-4">
              <MessageSquare className="h-5 w-5" />
            </span>

            <h3 className="font-display font-semibold mb-2">
              Feedback
            </h3>

            <p className="text-sm text-ink_text-muted leading-relaxed">
              Built for students and job seekers — share your
              ideas and suggestions to help us make resume
              building smarter and easier.
            </p>

          </div>
        </Card>

        {/* Contact Form */}
        <Card className="md:col-span-3">

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >

            {errors.root && (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {errors.root.message}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-ink_text-primary mb-1.5"
                >
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-violet-400/60 focus:outline-none transition-colors"
                  {...register('name', nameRules)}
                />

                {errors.name && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-ink_text-primary mb-1.5"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-violet-400/60 focus:outline-none transition-colors"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: emailPattern,
                  })}
                />

                {errors.email && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-ink_text-primary mb-1.5"
              >
                Subject
              </label>

              <input
                id="subject"
                type="text"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-violet-400/60 focus:outline-none transition-colors"
                {...register('subject', {
                  required: 'Subject is required',
                })}
              />

              {errors.subject && (
                <p className="mt-1 text-xs text-rose-400">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-ink_text-primary mb-1.5"
              >
                Message
              </label>

              <textarea
                id="message"
                rows={5}
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-violet-400/60 focus:outline-none transition-colors resize-none"
                {...register('message', {
                  required: 'Please add a message',
                  minLength: {
                    value: 10,
                    message: 'Add a little more detail',
                  },
                })}
              />

              {errors.message && (
                <p className="mt-1 text-xs text-rose-400">
                  {errors.message.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              icon={Send}
              iconPosition="right"
              fullWidth
            >
              Send message
            </Button>

          </form>
        </Card>

      </div>
    </div>
  );
}
