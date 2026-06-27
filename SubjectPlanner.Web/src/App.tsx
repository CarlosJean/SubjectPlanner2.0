import { Button, Card, Checkbox, Col, DatePicker, Flex, InputNumber, Row, TimePicker } from "antd";
import { useState } from "react";
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Importa los datos del idioma español


class Schedule {
  days: number[];
  hourFrom: string;
  hourTo: string;

  constructor(days: number[], hourFrom: string, hourTo: string) {    
    this.days = days;
    this.hourFrom = dayjs(hourFrom, "HH:mm").format('HH:mm');
    this.hourTo = dayjs(hourTo, "HH:mm").format('HH:mm');
  }
}

class ScheduleRequest {
  day: number;
  hourFrom: string;
  hourTo: string;

  constructor(day: number, hourFrom: string, hourTo: string) {
    this.day = Number(day);
    this.hourFrom = dayjs(hourFrom, 'HH:mm').format("HH:mm:ss").toString();
    this.hourTo = dayjs(hourTo, 'HH:mm').format("HH:mm:ss").toString();
  }
}

class Holiday {
  description: string;
  date: string;
  constructor(description: string, date: string) {
    this.description = description;
    this.date = date;
  }
}

class CalculationResult {
  endDate: string;
  classDays: number;
  holidays: Holiday[];

  constructor(endDate: string, classDays: number, holidays: Holiday[]) {
    this.endDate = endDate;
    this.classDays = classDays;
    this.holidays = holidays
  }
}

function App() {
  const [checkedOnes, setCheckedOnes] = useState<number[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [hourFrom, setHourFrom] = useState("");
  const [hourTo, setHourTo] = useState("");
  const [hours, setHours] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [calculationResult, setCalculationResult] = useState<CalculationResult>(new CalculationResult("", 0, []));

  function handleOnCheckBoxClick(value: number, { target }: any): void {
    if (target.checked) {
      setCheckedOnes([
        ...checkedOnes,
        value
      ]);
    } else {
      setCheckedOnes([
        ...checkedOnes.filter(c => c != value)
      ]);
    }
  }

  const handleOnClick = () => {
    let newSchedules: Schedule[] = schedules.map(s => {
      return new Schedule([...s.days.filter(x => !checkedOnes.includes(x))], s.hourFrom, s.hourTo);
    });

    newSchedules = [
      ...newSchedules,
      new Schedule([...checkedOnes], `${hourFrom}`, `${hourTo}`)
    ]

    newSchedules = newSchedules.filter(n => n.days.length > 0);

    setSchedules(newSchedules);
  }

  const handleSendRequest = async (): Promise<void> => {
    //Aquí se debe formar y enviar la solicitud
    const scheduleRequest = schedules
      .flatMap(schedule =>
        schedule.days
          .map(day => new ScheduleRequest(day, schedule.hourFrom, schedule.hourTo)));

    const request: any = {
      hours: Number(hours),
      startDate,
      Schedules: scheduleRequest
    };

    setCalculationResult(await getData(request));
  }


  const getData = async (request: any) => {
    const url = "http://localhost:5000/api/subjects";
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(request),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(error.message);
    }
  }

  const handleOnTextChange = (totalHours: any): void => {
    setHours(totalHours);
  }

  const handleOnDateChange = (dateString: any, target: string): void => {
    switch (target) {
      case "txtHourFrom":
        setHourFrom(dateString.toString());
        break;
      case "txtHourTo":
        setHourTo(dateString.toString());
        break;
      case "txtStartDate":
        setStartDate(dateString.toString());
        break;
      default:
        break;
    }
  }


  const handleOnRemoveSchedule = (scheduleIndex: number): void => {
    setSchedules(
      schedules
        .filter((_, index) => index != scheduleIndex)
    );
  }

  const getFormattedSchedule = (days:number[]) : string => {
    dayjs.locale("es");

    return days.map(day => dayjs().day(day).format('dd')).join(', ')
  }; 


  return (
    <>
      <Flex gap={"small"} justify="space-around" style={{ marginLeft: "10%", marginRight: "10%" }} wrap vertical>
        <Card title="Información de la materia">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <label htmlFor="txTotalHours">Horas totales</label>
                  <InputNumber min={1} id="txTotalHours" onChange={(totalHours) => handleOnTextChange(totalHours)} style={{ width: "100%" }}></InputNumber>
                </Col>
                <Col xs={24} sm={12}>
                  <label htmlFor="txtStartDate">Fecha de inicio</label>
                  <DatePicker id="txtStartDate" onChange={(_, dateString = '') => handleOnDateChange(dateString, 'txtStartDate')} style={{ width: "100%" }} placeholder="Seleccione una fecha" format={"DD/MM/YYYY"}></DatePicker>
                </Col>
                <Col span={24}>
                  <Row gutter={16}>
                    {schedules
                      .map((schedule, index) =>
                      (<Col span={8} key={index}>
                        <Card title={getFormattedSchedule(schedule.days)}>
                          <Row gutter={16}>
                            <Col span={24}>{schedule.hourFrom} - {schedule.hourTo}</Col>
                            <Col span={24}>
                              <Button color="danger" variant="dashed" onClick={() => handleOnRemoveSchedule(index)} style={{ width: "100%" }}>-</Button>
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                      ))
                    }
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col xs={24} sm={12}>
              <Row gutter={8}>
                <Col span={24}>
                  <Checkbox
                    id="1"
                    onChange={(e) => handleOnCheckBoxClick(1, e)}
                    type="checkbox">
                    L
                  </Checkbox>
                  <Checkbox
                    id="2"
                    onChange={(e) => handleOnCheckBoxClick(2, e)}
                    type="checkbox">
                    M
                  </Checkbox>
                  <Checkbox
                    id="3"
                    onChange={(e) => handleOnCheckBoxClick(3, e)}
                    type="checkbox">
                    X
                  </Checkbox>
                  <Checkbox
                    id="4"
                    onChange={(e) => handleOnCheckBoxClick(4, e)}
                    type="checkbox">
                    J
                  </Checkbox>
                  <Checkbox
                    id="5"
                    onChange={(e) => handleOnCheckBoxClick(5, e)}
                    type="checkbox">
                    V
                  </Checkbox>
                  <Checkbox
                    id="6"
                    onChange={(e) => handleOnCheckBoxClick(6, e)}
                    type="checkbox">
                    S
                  </Checkbox>
                  <Checkbox
                    id="0"
                    onChange={(e) => handleOnCheckBoxClick(0, e)}
                    type="checkbox">
                    D
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={24}>
                      <label htmlFor="txtHourFrom">Hora desde</label>
                    </Col>
                    <Col span={24}>
                      <TimePicker mode="time" id="txtHourFrom" onChange={(_, dateString) => handleOnDateChange(dateString, 'txtHourFrom')} placeholder="Seleccione una hora" format={"HH:mm"}></TimePicker>
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={24}>
                      <label htmlFor="txtHourTo">Hora hasta</label>
                    </Col>
                    <Col span={24}>
                      <TimePicker mode="time" id="txtHourTo" onChange={(_, dateString) => handleOnDateChange(dateString, 'txtHourTo')} placeholder="Seleccione una hora" format={"HH:mm"}></TimePicker>
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Flex align="start" justify="end" style={{ height: "100%" }} vertical>
                    <Button
                      type="default"
                      onClick={handleOnClick}
                    >
                      Añadir
                    </Button>
                  </Flex>
                </Col>
              </Row>
            </Col>
            <Col xs={24}>
              <Button
                type="primary"
                onClick={handleSendRequest}
                style={{ width: "100%" }}
              >
                Obtener resultados
              </Button>
            </Col>
          </Row>
        </Card>

        <Card title="Resultados">
          <Row>
            <Col>
              <p>
                Fecha de finalización <strong>{calculationResult.endDate}</strong>
              </p>
            </Col>
          </Row>
          <p>
            Días de clases <strong>{calculationResult.classDays}</strong>
          </p>

          <p>Feriados</p>
          <ul>
            {(calculationResult.holidays.length === 0 && calculationResult.classDays > 0 && <p>No hay feriados que afecten.</p>)}
            {calculationResult
              .holidays
              .map((holiday, index) => (<li key={index}>{holiday.date}</li>))}
          </ul>
        </Card>
      </Flex>
    </>
  )
}

export default App