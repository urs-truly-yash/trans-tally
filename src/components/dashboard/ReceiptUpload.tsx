import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { UploadIcon, FileIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface ReceiptUploadProps {
  onReceiptProcessed: () => void
}

export const ReceiptUpload = ({ onReceiptProcessed }: ReceiptUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<any>(null)
  
  const { toast } = useToast()

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `receipts/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath)

    return { filePath, publicUrl: data.publicUrl }
  }

  const createReceiptRecord = async (file: File, filePath: string, publicUrl: string) => {
    const { data, error } = await supabase
      .from('receipts')
      .insert({
        file_url: publicUrl,
        file_name: file.name,
        processing_status: 'pending'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  const processReceipt = async (receiptId: string) => {
    const { data, error } = await supabase.functions.invoke('process-receipt', {
      body: { receipt_id: receiptId }
    })

    if (error) {
      throw error
    }

    return data
  }

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image (JPEG, PNG, WebP) or PDF file',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB',
        variant: 'destructive',
      })
      return
    }

    setUploading(true)
    setProgress(10)

    try {
      // Upload file
      const { filePath, publicUrl } = await uploadFile(file)
      setProgress(30)

      // Create receipt record
      const receipt = await createReceiptRecord(file, filePath, publicUrl)
      setProgress(50)

      setUploading(false)
      setProcessing(true)

      // Process receipt with OCR
      const extractedData = await processReceipt(receipt.id)
      setProgress(100)

      setExtractedData(extractedData)
      
      toast({
        title: 'Receipt processed successfully',
        description: 'Transaction data has been extracted from your receipt',
      })

      onReceiptProcessed()
    } catch (error) {
      console.error('Error processing receipt:', error)
      toast({
        title: 'Error',
        description: 'Failed to process receipt. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      setProcessing(false)
      setProgress(0)
    }
  }, [toast, onReceiptProcessed])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Receipt</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your receipt here, or click to browse
            </p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="receipt-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="receipt-upload" className="cursor-pointer">
                Choose File
              </label>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supports JPEG, PNG, WebP, and PDF files up to 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {(uploading || processing) && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {uploading ? 'Uploading...' : 'Processing with OCR...'}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Data */}
      {extractedData && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <h3 className="font-medium">Extracted Data</h3>
              <Badge variant="default">OCR Complete</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-muted-foreground">Total Amount</label>
                <p className="text-lg font-semibold">${extractedData.total}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Date</label>
                <p>{extractedData.date}</p>
              </div>
              <div className="col-span-2">
                <label className="font-medium text-muted-foreground">Merchant</label>
                <p>{extractedData.merchant}</p>
              </div>
            </div>

            {extractedData.items && extractedData.items.length > 0 && (
              <div className="mt-4">
                <label className="font-medium text-muted-foreground">Items</label>
                <div className="mt-2 space-y-1">
                  {extractedData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>${item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              className="w-full mt-4" 
              onClick={() => {
                // Pre-fill transaction form with extracted data
                // This would require lifting state up or using a form context
                toast({
                  title: 'Data Ready',
                  description: 'Switch to the Add Transaction tab to create a transaction with this data',
                })
              }}
            >
              Create Transaction from Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}