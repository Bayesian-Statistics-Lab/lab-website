import {NextResponse} from 'next/server';import {members} from '@/lib/data';export async function GET(){return NextResponse.json({data:await members()})}
