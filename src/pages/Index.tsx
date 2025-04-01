
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Camera, Mic, ArrowRight, X, Download, Languages, Settings, ChevronDown, ChevronUp, Volume2, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

// Language options for TTS
const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
];

export default function Index() {
  // State variables
  const [translatedText, setTranslatedText] = useState('');
  const [inputText, setInputText] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [ttsSettings, setTtsSettings] = useState({
    language: 'en',
    pitch: 1,
    rate: 0.75,
    volume: 1
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [hasAudioAccess, setHasAudioAccess] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [webStream, setWebStream] = useState(null);
  const cameraWidth = 400;
  const cameraHeight = 300;

  // Permission setup
  useEffect(() => {
    const setupPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setWebStream(stream);
        }
        setHasCameraAccess(true);
        toast({
          title: "Camera access granted",
          description: "You can now use the camera for sign language translation.",
        });
      } catch (error) {
        console.error('Camera access denied:', error);
        setHasCameraAccess(false);
        toast({
          title: "Camera access denied",
          description: "Please enable camera access to use this feature.",
          variant: "destructive"
        });
      }

      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasAudioAccess(true);
      } catch (error) {
        console.error('Audio access denied:', error);
        setHasAudioAccess(false);
        toast({
          title: "Microphone access denied",
          description: "Please enable microphone access to use the voice feature.",
          variant: "destructive"
        });
      }
    };

    setupPermissions();

    return () => {
      if (webStream) {
        webStream.getTracks().forEach(track => track.stop());
      }
      // Stop any ongoing speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Enhanced Text-to-Speech function
  const speakText = () => {
    if (!translatedText || !('speechSynthesis' in window)) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = ttsSettings.language;
    utterance.pitch = ttsSettings.pitch;
    utterance.rate = ttsSettings.rate;
    utterance.volume = ttsSettings.volume;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      console.error('Speech error');
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Toggle TTS settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Update TTS settings
  const updateTtsSetting = (key, value) => {
    setTtsSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Camera Capture Methods
  const captureImage = async () => {
    try {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
      }

      setIsProcessing(true);
      toast({
        title: "Processing image",
        description: "Translating sign language...",
      });
      
      // Simulate processing delay - in a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTranslatedText('Hello! How are you? (Sample Sign Language Translation)');
      setIsProcessing(false);
      
      toast({
        title: "Translation complete",
        description: "Sign language has been translated successfully.",
      });
    } catch (error) {
      console.error("Image capture error:", error);
      setTranslatedText('Error in translation');
      setIsProcessing(false);
      
      toast({
        title: "Translation error",
        description: "There was an error processing the sign language.",
        variant: "destructive"
      });
    }
  };

  // Voice Recording Methods
  const startRecording = async () => {
    if (!hasAudioAccess) {
      toast({
        title: "Microphone access required",
        description: "Please enable microphone access to use this feature.",
        variant: "destructive"
      });
      return;
    }

    try {
      setRecordingStatus('recording');
      toast({
        title: "Recording started",
        description: "Speak clearly for best results.",
      });
      
      // Simulate recording process - in a real app, this would use the Web Audio API
      setTimeout(() => {
        toast({
          title: "Listening...",
          description: "Press the microphone button again to stop recording.",
        });
      }, 1000);
    } catch (error) {
      console.error('Recording start error:', error);
      toast({
        title: "Recording error",
        description: "There was an error starting the recording.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = async () => {
    try {
      setRecordingStatus('idle');
      
      toast({
        title: "Processing audio",
        description: "Converting speech to text...",
      });
      
      // Simulate processing delay - in a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTranslatedText('This is a sample voice recognition text for demonstration purposes.');
      
      toast({
        title: "Speech recognized",
        description: "Your speech has been converted to text.",
      });
    } catch (error) {
      console.error('Recording stop error:', error);
      toast({
        title: "Processing error",
        description: "There was an error processing the recording.",
        variant: "destructive"
      });
    }
  };

  const resetTranslation = () => {
    setTranslatedText('');
    setInputText('');
    setCapturedImage(null);
    toast({
      title: "Reset complete",
      description: "Translation has been cleared.",
    });
  };

  const downloadImage = async () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `sign_language_capture_${Date.now()}.jpg`;
      link.click();
      
      toast({
        title: "Download complete",
        description: "Image has been downloaded successfully.",
      });
    }
  };

  // Handle text input translation
  const handleTextTranslation = () => {
    if (inputText.trim()) {
      setTranslatedText(inputText);
      toast({
        title: "Text processed",
        description: "Your text has been processed successfully.",
      });
    } else {
      toast({
        title: "Empty input",
        description: "Please enter some text to translate.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-violet-900">
      {/* Header with glassmorphism effect */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-black/20 border-b border-white/10 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Languages className="h-6 w-6 text-indigo-300" />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                TalkHands Express
              </h1>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-indigo-200 hover:text-white hover:bg-white/10">
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-violet-950/90 backdrop-blur-xl border border-indigo-500/30 text-indigo-100">
                <h2 className="text-xl font-bold mb-4">Application Settings</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Theme</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="border-indigo-500/50 bg-indigo-950/50">Dark (Default)</Button>
                      <Button variant="outline" className="border-indigo-500/50 bg-indigo-950/50 opacity-50">Light (Coming Soon)</Button>
                    </div>
                  </div>
                  
                  <Separator className="bg-indigo-800/30" />
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Camera</h3>
                    <div className="flex items-center justify-between">
                      <span>Access Status</span>
                      <Badge variant={hasCameraAccess ? "default" : "destructive"}>
                        {hasCameraAccess ? "Granted" : "Denied"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Microphone</h3>
                    <div className="flex items-center justify-between">
                      <span>Access Status</span>
                      <Badge variant={hasAudioAccess ? "default" : "destructive"}>
                        {hasAudioAccess ? "Granted" : "Denied"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 py-8 space-y-6">
        {/* Input Methods Tabs */}
        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6 bg-black/20 border border-white/10">
            <TabsTrigger value="camera" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="voice" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Mic className="h-4 w-4 mr-2" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="text" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <ArrowRight className="h-4 w-4 mr-2" />
              Text
            </TabsTrigger>
          </TabsList>
          
          <div className="flex justify-center">
            {/* Camera Tab */}
            <TabsContent value="camera" className="w-full max-w-2xl">
              <Card className="bg-black/20 backdrop-blur-md border-indigo-400/20 overflow-hidden">
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-indigo-100 text-center">Sign Language Recognition</h2>
                  
                  <div className="relative">
                    {capturedImage ? (
                      <div className="relative">
                        <img 
                          src={capturedImage} 
                          alt="Captured sign language" 
                          className="rounded-xl w-full h-auto max-h-[400px] object-contain mx-auto bg-black/40"
                        />
                        <div className="absolute bottom-4 right-4 flex space-x-2">
                          <Button 
                            variant="secondary" 
                            size="icon"
                            onClick={downloadImage}
                            className="rounded-full bg-indigo-600/80 hover:bg-indigo-600 text-white border-none"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="icon"
                            onClick={() => setCapturedImage(null)}
                            className="rounded-full bg-red-600/80 hover:bg-red-600 text-white border-none"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative bg-black/30 rounded-xl overflow-hidden mx-auto" style={{ width: cameraWidth, height: cameraHeight }}>
                        {hasCameraAccess ? (
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-violet-900/20 text-center p-4">
                            <div>
                              <Camera className="h-12 w-12 mx-auto mb-2 text-indigo-300/50" />
                              <p className="text-indigo-200">Camera access is required for this feature</p>
                              <Button 
                                variant="secondary" 
                                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                                onClick={() => {
                                  navigator.mediaDevices.getUserMedia({ video: true })
                                    .then(stream => {
                                      if (videoRef.current) {
                                        videoRef.current.srcObject = stream;
                                        setWebStream(stream);
                                      }
                                      setHasCameraAccess(true);
                                    })
                                    .catch(err => {
                                      console.error("Camera access error:", err);
                                      toast({
                                        title: "Camera access denied",
                                        description: "Please enable camera access in your browser settings.",
                                        variant: "destructive"
                                      });
                                    });
                                }}
                              >
                                Enable Camera
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {hasCameraAccess && (
                          <Button
                            variant="secondary"
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-full w-14 h-14 p-0 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none shadow-lg"
                            onClick={captureImage}
                            disabled={isProcessing}
                          >
                            <Camera className="h-6 w-6 text-white" />
                          </Button>
                        )}
                        
                        {/* Hidden canvas for capturing images */}
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            {/* Voice Tab */}
            <TabsContent value="voice" className="w-full max-w-2xl">
              <Card className="bg-black/20 backdrop-blur-md border-indigo-400/20">
                <div className="p-6 space-y-4 flex flex-col items-center">
                  <h2 className="text-xl font-semibold text-indigo-100">Voice Recognition</h2>
                  
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className={cn(
                      "relative flex items-center justify-center",
                      recordingStatus === 'recording' && "after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-red-500/30"
                    )}>
                      <Button
                        variant="secondary"
                        className={cn(
                          "rounded-full w-24 h-24 p-0 shadow-lg transition-all duration-300 border-4",
                          recordingStatus === 'recording' 
                            ? "bg-gradient-to-tr from-red-600 to-red-400 border-red-300/50 hover:from-red-500 hover:to-red-300"
                            : "bg-gradient-to-tr from-indigo-600 to-purple-600 border-indigo-300/50 hover:from-indigo-500 hover:to-purple-500"
                        )}
                        onClick={recordingStatus === 'recording' ? stopRecording : startRecording}
                        disabled={!hasAudioAccess}
                      >
                        {recordingStatus === 'recording' ? (
                          <div className="flex items-center justify-center animate-pulse">
                            <MicOff className="h-10 w-10 text-white" />
                          </div>
                        ) : (
                          <Mic className="h-10 w-10 text-white" />
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-indigo-200 mt-6">
                      {recordingStatus === 'recording' 
                        ? "Recording... Tap to stop" 
                        : "Tap microphone to start recording"}
                    </p>
                    
                    {!hasAudioAccess && (
                      <div className="mt-4 text-center">
                        <p className="text-yellow-200 mb-2">Microphone access is required for this feature</p>
                        <Button 
                          variant="secondary" 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                          onClick={() => {
                            navigator.mediaDevices.getUserMedia({ audio: true })
                              .then(() => {
                                setHasAudioAccess(true);
                                toast({
                                  title: "Microphone access granted",
                                  description: "You can now use the voice recognition feature.",
                                });
                              })
                              .catch(err => {
                                console.error("Microphone access error:", err);
                                toast({
                                  title: "Microphone access denied",
                                  description: "Please enable microphone access in your browser settings.",
                                  variant: "destructive"
                                });
                              });
                          }}
                        >
                          Enable Microphone
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            {/* Text Tab */}
            <TabsContent value="text" className="w-full max-w-2xl">
              <Card className="bg-black/20 backdrop-blur-md border-indigo-400/20">
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-indigo-100 text-center">Text Input</h2>
                  
                  <div className="space-y-4">
                    <textarea
                      className="w-full h-40 p-4 bg-black/30 text-indigo-100 placeholder:text-indigo-300/50 rounded-xl border border-indigo-500/30 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none resize-none"
                      placeholder="Enter text to translate..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    
                    <Button 
                      className="w-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium"
                      onClick={handleTextTranslation}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Process Text
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
        
        {/* Output Card with Glassmorphism */}
        <Card className="bg-black/30 backdrop-blur-xl border-indigo-400/20 max-w-2xl mx-auto overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-100">Translation Result</h2>
              
              {translatedText && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={resetTranslation}
                    className="text-indigo-200 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-indigo-200 hover:text-white hover:bg-white/10 flex items-center space-x-1"
                      >
                        <span className="uppercase text-xs font-bold">{ttsSettings.language}</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-violet-950/90 backdrop-blur-xl border border-indigo-500/30 text-indigo-100">
                      <h2 className="text-xl font-bold mb-4">Speech Settings</h2>
                      
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="font-medium">Language</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {LANGUAGE_OPTIONS.map(lang => (
                              <Button 
                                key={lang.code}
                                variant={ttsSettings.language === lang.code ? "default" : "outline"}
                                className={ttsSettings.language === lang.code 
                                  ? "bg-indigo-600 hover:bg-indigo-700 text-white border-none" 
                                  : "border-indigo-500/50 bg-indigo-950/50 text-indigo-200"
                                }
                                onClick={() => updateTtsSetting('language', lang.code)}
                              >
                                {lang.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">Speech Rate</h3>
                            <span className="text-sm">{ttsSettings.rate.toFixed(1)}x</span>
                          </div>
                          <Slider
                            min={0.5}
                            max={1.5}
                            step={0.1}
                            value={[ttsSettings.rate]}
                            onValueChange={(values) => updateTtsSetting('rate', values[0])}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">Pitch</h3>
                            <span className="text-sm">{ttsSettings.pitch.toFixed(1)}x</span>
                          </div>
                          <Slider
                            min={0.5}
                            max={2}
                            step={0.1}
                            value={[ttsSettings.pitch]}
                            onValueChange={(values) => updateTtsSetting('pitch', values[0])}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={isSpeaking ? stopSpeaking : speakText}
                    className={cn(
                      "text-indigo-200 hover:text-white hover:bg-white/10 relative",
                      isSpeaking && "text-indigo-400"
                    )}
                  >
                    {isSpeaking && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20"></span>
                    )}
                    <Volume2 className={cn(
                      "h-4 w-4",
                      isSpeaking && "animate-pulse"
                    )} />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="bg-black/20 rounded-xl p-6 min-h-[120px] flex items-center justify-center">
              {translatedText ? (
                <p className="text-indigo-100 text-center text-lg leading-relaxed">{translatedText}</p>
              ) : (
                <p className="text-indigo-300/50 text-center italic">Translation will appear here</p>
              )}
            </div>
          </div>
        </Card>
      </main>
      
      <footer className="mt-auto py-6 backdrop-blur-md bg-black/20 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-indigo-300/70 text-sm">TalkHands Express - Sign Language Translation Tool</p>
        </div>
      </footer>
    </div>
  );
}
