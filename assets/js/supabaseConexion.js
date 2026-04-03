import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://msnggfpwmfopmhbigmir.supabase.co'
const supabaseKey = 'sb_publishable_Gn9Ql70Dp5jI50-_V97wLA_ecChkQgH'

export const supabase = createClient(supabaseUrl, supabaseKey)