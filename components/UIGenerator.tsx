'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCompletion } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import DOMPurify from 'dompurify';
import Highlight from 'react-highlight';
import 'highlight.js/styles/github.css';

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function UIGenerator() {
  const [previewType, setPreviewType] = useState<'html' | 'react'>('html');
  const [generatedCode, setGeneratedCode] = useState<{ html: string; react: string } | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  const { complete, completion, isLoading, error } = useCompletion({
    api: '/api/generate-ui',
  });

  const onSubmit = async (data: FormData) => {
    try {
      await complete(data.description);
      if (completion) {
        const parsed = JSON.parse(completion);
        setGeneratedCode(parsed);
      }
    } catch (error) {
      console.error('Error generating UI:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">AI-Powered UI Generator</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Describe your desired UI
          </label>
          <Textarea
            id="description"
            placeholder="Enter a detailed description of the UI you want to generate..."
            {...form.register('description')}
            className="w-full p-2 border rounded-md"
          />
          {form.formState.errors.description && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.description.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate UI'
          )}
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      {generatedCode && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Generated UI Code:</h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="preview-type"
                checked={previewType === 'react'}
                onCheckedChange={(checked) => setPreviewType(checked ? 'react' : 'html')}
              />
              <Label htmlFor="preview-type">Show React</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{previewType === 'html' ? 'HTML' : 'React'} Code:</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(previewType === 'html' ? generatedCode.html : generatedCode.react)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Highlight className="html">
                {previewType === 'html' ? generatedCode.html : generatedCode.react}
              </Highlight>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Preview:</h3>
              <div className="border rounded-md p-4 bg-white">
                {previewType === 'html' && (
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generatedCode.html) }} />
                )}
                {previewType === 'react' && (
                  <div className="bg-gray-100 p-4 rounded">
                    <p>React component preview not available. Please copy and use the code in a React environment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}