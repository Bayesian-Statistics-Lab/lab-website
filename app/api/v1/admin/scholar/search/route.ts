import {NextRequest} from 'next/server';import {handleScholar} from '@/lib/scholar-api';export async function POST(req:NextRequest){return handleScholar(req,'search')}
