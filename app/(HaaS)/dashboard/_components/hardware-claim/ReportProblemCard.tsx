import { ReportProblemIlustration } from '@/components/resources/ilustrations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import React from 'react'

const ReportProblemCard = () => {
    return <Card className='w-52 h-full shrink-0 mb-0'>
        <CardHeader className='text-center font-bold'>
            Reportar Problema
            <CardDescription className='font-medium text-muted-foreground'>
                Teve algum problema com a receção do seu hardware?
            </CardDescription>
        </CardHeader>
        <CardContent className='h-full flex flex-col gap-5 items-center justify-center'>
            <ReportProblemIlustration width={150} />
            <Button variant="ghost" className='text-primary' >
                Abrir Ticket
            </Button>
        </CardContent>
    </Card>
}

export default ReportProblemCard