import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HardwareProgress } from '@/lib/data/hardware'
import ChartComponent from './ChartComponent';


interface GeneralSensorRegisterCardProps {
    deviceList: HardwareProgress;
    title: string
}

const GeneralSensorRegisterCard = ({ deviceList, title }: GeneralSensorRegisterCardProps) => {

    return (<Card className="flex flex-col h-full w-64">
        <CardHeader className="items-center pb-0">
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
            <ChartComponent
                gatewaysData={deviceList.gateways}
                sensorsData={deviceList.sensors}
            />
        </CardContent>

    </Card>
    )
}

export default GeneralSensorRegisterCard
