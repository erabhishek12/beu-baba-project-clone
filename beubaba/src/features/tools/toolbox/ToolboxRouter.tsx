import { Navigate, useParams } from 'react-router-dom'
import { OcrTool } from './OcrTool'
import { TranslatorTool } from './TranslatorTool'
import {
  CgpaTool,
  SgpaTool,
  GpaTargetTool,
  PercentageTool,
  MarksTool,
  AttendanceTool,
} from './AcademicTools'
import {
  AgeTool,
  DateDiffTool,
  UnitConverterTool,
  ScientificTool,
  TextFormatterTool,
  PasswordTool,
  QrTool,
} from './UtilityTools'
import { PomodoroTool, ExamCountdownTool } from './ProductivityTools'

const TOOLS: Record<string, () => React.ReactElement> = {
  cgpa: CgpaTool,
  sgpa: SgpaTool,
  'gpa-target': GpaTargetTool,
  percentage: PercentageTool,
  marks: MarksTool,
  attendance: AttendanceTool,
  ocr: OcrTool,
  translator: TranslatorTool,
  age: AgeTool,
  'date-diff': DateDiffTool,
  'unit-converter': UnitConverterTool,
  scientific: ScientificTool,
  'text-formatter': TextFormatterTool,
  password: PasswordTool,
  qr: QrTool,
  pomodoro: PomodoroTool,
  'exam-countdown': ExamCountdownTool,
}

export function ToolboxRouter() {
  const { slug = '' } = useParams()
  const Tool = TOOLS[slug]
  if (!Tool) return <Navigate to="/tools/toolbox" replace />
  return <Tool />
}
