import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const body = await req.json()
    const { receipt_id } = body

    // Update receipt status to processing
    await supabaseClient
      .from('receipts')
      .update({ processing_status: 'processing' })
      .eq('id', receipt_id)

    // Get receipt file URL
    const { data: receipt } = await supabaseClient
      .from('receipts')
      .select('file_url')
      .eq('id', receipt_id)
      .single()

    if (!receipt) {
      return new Response('Receipt not found', { status: 404, headers: corsHeaders })
    }

    // Mock OCR processing - in production, integrate with services like Google Vision API
    // For now, we'll simulate extracting basic receipt data
    const mockExtractedData = {
      total: Math.floor(Math.random() * 10000) / 100, // Random amount for demo
      date: new Date().toISOString().split('T')[0],
      merchant: 'Sample Store',
      items: [
        { name: 'Item 1', price: 15.99 },
        { name: 'Item 2', price: 23.50 }
      ]
    }

    // Update receipt with extracted data
    const { data, error } = await supabaseClient
      .from('receipts')
      .update({
        processing_status: 'completed',
        extracted_data: mockExtractedData
      })
      .eq('id', receipt_id)
      .select()

    if (error) {
      await supabaseClient
        .from('receipts')
        .update({ processing_status: 'failed' })
        .eq('id', receipt_id)

      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ data: mockExtractedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})