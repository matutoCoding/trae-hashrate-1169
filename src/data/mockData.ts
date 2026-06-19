import type {
  DroneFleet,
  PerformanceSlot,
  OccupancyBlock,
  MergeLog,
  SplitLog,
  ApprovalFlow,
  ApprovalRequest,
  ReminderRecord,
  AirspaceReport,
  Organizer,
  User,
  DashboardStats,
} from '@/types';

export const mockUsers: User[] = [
  { id: 'u001', name: '张云天', role: 'admin', email: 'zhangyt@skystage.cn', phone: '13800138000', department: '技术部' },
  { id: 'u002', name: '李星航', role: 'scheduler', email: 'lixh@skystage.cn', phone: '13800138001', department: '运营中心' },
  { id: 'u003', name: '王鹏程', role: 'scheduler', email: 'wangpc@skystage.cn', phone: '13800138002', department: '运营中心' },
  { id: 'u004', name: '陈空域', role: 'approver', email: 'chenky@caac.gov.cn', phone: '13800138003', department: '民航局审批处' },
  { id: 'u005', name: '刘警戒', role: 'approver', email: 'liujj@mil.cn', phone: '13800138004', department: '军航管制部' },
  { id: 'u006', name: '赵督查', role: 'auditor', email: 'zhaodc@skystage.cn', phone: '13800138005', department: '合规审计部' },
  { id: 'u007', name: '孙副总', role: 'approver', email: 'sunfz@skystage.cn', phone: '13800138006', department: '总经办' },
];

export const mockOrganizers: Organizer[] = [
  { id: 'org001', name: '星河文化旅游集团', contactPerson: '周经理', contactPhone: '13900139001', contactEmail: 'zhou@starlight.com', companyType: '文旅集团', qualificationLevel: 'A' },
  { id: 'org002', name: '璀璨城市营销有限公司', contactPerson: '吴总', contactPhone: '13900139002', contactEmail: 'wu@brightcity.com', companyType: '营销传媒', qualificationLevel: 'A' },
  { id: 'org003', name: '盛世节庆策划中心', contactPerson: '郑策划', contactPhone: '13900139003', contactEmail: 'zheng@shengshi.cn', companyType: '活动策划', qualificationLevel: 'B' },
  { id: 'org004', name: '云帆商业地产集团', contactPerson: '冯总', contactPhone: '13900139004', contactEmail: 'feng@yunfan.com', companyType: '商业地产', qualificationLevel: 'A' },
  { id: 'org005', name: '启航科技文化公司', contactPerson: '许经理', contactPhone: '13900139005', contactEmail: 'xu@qihang.cn', companyType: '科技文化', qualificationLevel: 'B' },
];

export const mockFleets: DroneFleet[] = [
  { id: 'f001', name: '天狼星一号编队', droneCount: 1000, droneModel: 'DJI-Matrice-300', maxAltitude: 500, maxFlightTime: 28, status: 'available', location: '北京密云基地', createdAt: '2025-11-15T10:00:00' },
  { id: 'f002', name: '北极星二号编队', droneCount: 2000, droneModel: 'DJI-Inspire-4', maxAltitude: 600, maxFlightTime: 32, status: 'in_use', location: '上海浦东基地', createdAt: '2025-12-01T09:00:00' },
  { id: 'f003', name: '织女星三号编队', droneCount: 500, droneModel: 'Autel-EVO-II', maxAltitude: 400, maxFlightTime: 25, status: 'available', location: '广州白云基地', createdAt: '2026-01-10T08:00:00' },
  { id: 'f004', name: '参宿四特别编队', droneCount: 3000, droneModel: 'Skydio-X2', maxAltitude: 700, maxFlightTime: 35, status: 'maintenance', location: '深圳宝安基地', createdAt: '2026-02-20T14:00:00' },
  { id: 'f005', name: '开普勒五号编队', droneCount: 800, droneModel: 'Parrot-Anafi', maxAltitude: 450, maxFlightTime: 26, status: 'available', location: '杭州萧山基地', createdAt: '2026-03-05T11:00:00' },
  { id: 'f006', name: '仙女座六号编队', droneCount: 1500, droneModel: 'DJI-Matrice-300', maxAltitude: 500, maxFlightTime: 28, status: 'available', location: '成都双流基地', createdAt: '2026-04-18T16:00:00' },
];

const today = new Date();
const isoDate = (offsetDays: number, hour: number, minute: number = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const mockSlots: PerformanceSlot[] = [
  { id: 's001', title: '星河周年庆·开场灯光秀', organizerId: 'org001', organizerName: '星河文化旅游集团', fleetId: 'f001', fleetName: '天狼星一号编队', startTime: isoDate(0, 19), endTime: isoDate(0, 20), status: 'approved', airspaceArea: '朝阳公园上空', estimatedAttendance: 50000, occupancyId: 'occ001', createdAt: isoDate(-7, 10), updatedAt: isoDate(-2, 15) },
  { id: 's002', title: '星河周年庆·主秀表演', organizerId: 'org001', organizerName: '星河文化旅游集团', fleetId: 'f001', fleetName: '天狼星一号编队', startTime: isoDate(0, 20), endTime: isoDate(0, 21, 30), status: 'approved', airspaceArea: '朝阳公园上空', estimatedAttendance: 50000, occupancyId: 'occ001', createdAt: isoDate(-7, 10), updatedAt: isoDate(-2, 15) },
  { id: 's003', title: '璀璨之夜·城市营销', organizerId: 'org002', organizerName: '璀璨城市营销有限公司', fleetId: 'f002', fleetName: '北极星二号编队', startTime: isoDate(0, 21), endTime: isoDate(0, 22), status: 'confirmed', airspaceArea: '外滩上空', estimatedAttendance: 80000, occupancyId: 'occ002', createdAt: isoDate(-5, 14), updatedAt: isoDate(-1, 9) },
  { id: 's004', title: '盛世华诞·国庆庆典', organizerId: 'org003', organizerName: '盛世节庆策划中心', fleetId: 'f003', fleetName: '织女星三号编队', startTime: isoDate(1, 20), endTime: isoDate(1, 21), status: 'confirmed', airspaceArea: '天安门广场', estimatedAttendance: 100000, createdAt: isoDate(-3, 11), updatedAt: isoDate(0, 8) },
  { id: 's005', title: '盛世华诞·烟火联动', organizerId: 'org003', organizerName: '盛世节庆策划中心', fleetId: 'f003', fleetName: '织女星三号编队', startTime: isoDate(1, 21), endTime: isoDate(1, 22), status: 'confirmed', airspaceArea: '天安门广场', estimatedAttendance: 100000, createdAt: isoDate(-3, 11), updatedAt: isoDate(0, 8) },
  { id: 's006', title: '云帆广场开业盛典', organizerId: 'org004', organizerName: '云帆商业地产集团', fleetId: 'f005', fleetName: '开普勒五号编队', startTime: isoDate(2, 19, 30), endTime: isoDate(2, 20, 30), status: 'confirmed', airspaceArea: '云帆商业中心', estimatedAttendance: 30000, createdAt: isoDate(-2, 16), updatedAt: isoDate(-1, 11) },
  { id: 's007', title: '启航科技新品发布', organizerId: 'org005', organizerName: '启航科技文化公司', fleetId: 'f006', fleetName: '仙女座六号编队', startTime: isoDate(3, 20), endTime: isoDate(3, 21), status: 'draft', airspaceArea: '未来科技城', estimatedAttendance: 15000, createdAt: isoDate(-1, 9), updatedAt: isoDate(0, 14) },
  { id: 's008', title: '星河跨年倒计时', organizerId: 'org001', organizerName: '星河文化旅游集团', fleetId: 'f001', fleetName: '天狼星一号编队', startTime: isoDate(7, 23), endTime: isoDate(8, 0, 30), status: 'confirmed', airspaceArea: '朝阳公园上空', estimatedAttendance: 120000, createdAt: isoDate(-1, 13), updatedAt: isoDate(0, 10) },
  { id: 's009', title: '星河跨年·零点祝福', organizerId: 'org001', organizerName: '星河文化旅游集团', fleetId: 'f001', fleetName: '天狼星一号编队', startTime: isoDate(8, 0, 30), endTime: isoDate(8, 1), status: 'confirmed', airspaceArea: '朝阳公园上空', estimatedAttendance: 120000, createdAt: isoDate(-1, 13), updatedAt: isoDate(0, 10) },
  { id: 's010', title: '城市之夜晚会', organizerId: 'org002', organizerName: '璀璨城市营销有限公司', fleetId: 'f002', fleetName: '北极星二号编队', startTime: isoDate(4, 20), endTime: isoDate(4, 21, 30), status: 'confirmed', airspaceArea: '陆家嘴上空', estimatedAttendance: 60000, createdAt: isoDate(0, 11), updatedAt: isoDate(0, 15) },
  { id: 's011', title: '已完成的春日节', organizerId: 'org003', organizerName: '盛世节庆策划中心', fleetId: 'f005', fleetName: '开普勒五号编队', startTime: isoDate(-3, 20), endTime: isoDate(-3, 21), status: 'completed', airspaceArea: '西湖景区', estimatedAttendance: 40000, createdAt: isoDate(-10, 9), updatedAt: isoDate(-3, 22) },
  { id: 's012', title: '已取消的商业活动', organizerId: 'org004', organizerName: '云帆商业地产集团', fleetId: 'f006', fleetName: '仙女座六号编队', startTime: isoDate(-1, 19), endTime: isoDate(-1, 20), status: 'cancelled', airspaceArea: '春熙路', estimatedAttendance: 20000, createdAt: isoDate(-8, 14), updatedAt: isoDate(-2, 16) },
];

export const mockOccupancies: OccupancyBlock[] = [
  { id: 'occ001', organizerId: 'org001', organizerName: '星河文化旅游集团', fleetId: 'f001', fleetName: '天狼星一号编队', startTime: isoDate(0, 19), endTime: isoDate(0, 21, 30), slotIds: ['s001', 's002'], isMerged: true, mergedFromIds: ['occ_temp1', 'occ_temp2'], status: 'active', createdAt: isoDate(-2, 15) },
  { id: 'occ002', organizerId: 'org002', organizerName: '璀璨城市营销有限公司', fleetId: 'f002', fleetName: '北极星二号编队', startTime: isoDate(0, 21), endTime: isoDate(0, 22), slotIds: ['s003'], isMerged: false, status: 'active', createdAt: isoDate(-1, 9) },
  { id: 'occ003', organizerId: 'org003', organizerName: '盛世节庆策划中心', fleetId: 'f003', fleetName: '织女星三号编队', startTime: isoDate(1, 20), endTime: isoDate(1, 22), slotIds: ['s004', 's005'], isMerged: true, mergedFromIds: ['occ_temp3', 'occ_temp4'], status: 'active', createdAt: isoDate(0, 8) },
  { id: 'occ004', organizerId: 'org001', organizerName: '星河文化旅游集团', fleetId: 'f001', fleetName: '天狼星一号编队', startTime: isoDate(7, 23), endTime: isoDate(8, 1), slotIds: ['s008', 's009'], isMerged: true, mergedFromIds: ['occ_temp5', 'occ_temp6'], status: 'active', createdAt: isoDate(0, 10) },
];

export const mockMergeLogs: MergeLog[] = [
  { id: 'ml001', mergedOccupancyId: 'occ001', sourceOccupancyIds: ['occ_temp1', 'occ_temp2'], operatorId: 'u002', operatorName: '李星航', operationTime: isoDate(-2, 15), remark: '同一主办方连续两场自动合并' },
  { id: 'ml002', mergedOccupancyId: 'occ003', sourceOccupancyIds: ['occ_temp3', 'occ_temp4'], operatorId: 'u003', operatorName: '王鹏程', operationTime: isoDate(0, 8), remark: '国庆庆典两场连排合并占用' },
  { id: 'ml003', mergedOccupancyId: 'occ004', sourceOccupancyIds: ['occ_temp5', 'occ_temp6'], operatorId: 'u002', operatorName: '李星航', operationTime: isoDate(0, 10), remark: '跨年倒计时与零点祝福跨零点合并' },
];

export const mockSplitLogs: SplitLog[] = [
  { id: 'sl001', sourceOccupancyId: 'occ_split_old1', resultOccupancyIds: ['occ_new1', 'occ_new2'], splitPoint: isoDate(-5, 21), operatorId: 'u002', operatorName: '李星航', reason: '主办方中途退订后半段时段', operationTime: isoDate(-4, 9) },
  { id: 'sl002', sourceOccupancyId: 'occ_split_old2', resultOccupancyIds: ['occ_new3', 'occ_new4'], splitPoint: isoDate(-10, 20, 30), operatorId: 'u003', operatorName: '王鹏程', reason: '空域限制部分时段不可用', operationTime: isoDate(-9, 14) },
];

export const mockApprovalFlows: ApprovalFlow[] = [
  {
    id: 'flow001',
    name: '标准空域审批流程',
    isActive: true,
    nodes: [
      { id: 'n001', name: '内部合规审核', order: 1, assigneeId: 'u002', assigneeName: '李星航', timeoutHours: 4, escalateAfterHours: 8, escalationTargetId: 'u007', escalationTargetName: '孙副总' },
      { id: 'n002', name: '民航局空域审批', order: 2, assigneeId: 'u004', assigneeName: '陈空域', timeoutHours: 24, escalateAfterHours: 48, escalationTargetId: 'u007', escalationTargetName: '孙副总' },
      { id: 'n003', name: '军航管制报备', order: 3, assigneeId: 'u005', assigneeName: '刘警戒', timeoutHours: 48, escalateAfterHours: 72, escalationTargetId: 'u007', escalationTargetName: '孙副总' },
    ],
  },
  {
    id: 'flow002',
    name: '简化审批流程(低空空域)',
    isActive: true,
    nodes: [
      { id: 'n004', name: '快速审核', order: 1, assigneeId: 'u003', assigneeName: '王鹏程', timeoutHours: 2, escalateAfterHours: 4, escalationTargetId: 'u002', escalationTargetName: '李星航' },
      { id: 'n005', name: '民航备案', order: 2, assigneeId: 'u004', assigneeName: '陈空域', timeoutHours: 12, escalateAfterHours: 24, escalationTargetId: 'u007', escalationTargetName: '孙副总' },
    ],
  },
];

export const mockApprovalRequests: ApprovalRequest[] = [
  {
    id: 'apr001', slotId: 's003', slotTitle: '璀璨之夜·城市营销', flowId: 'flow001', flowName: '标准空域审批流程',
    currentNodeOrder: 2, status: 'pending', submissionTime: isoDate(-1, 10),
    timeline: [
      { id: 't001', nodeId: 'n001', nodeName: '内部合规审核', operatorId: 'u002', operatorName: '李星航', action: 'submit', comment: '提交内部审核', timestamp: isoDate(-1, 10) },
      { id: 't002', nodeId: 'n001', nodeName: '内部合规审核', operatorId: 'u002', operatorName: '李星航', action: 'approve', comment: '资料齐全，合规通过', timestamp: isoDate(-1, 12, 30) },
      { id: 't003', nodeId: 'n002', nodeName: '民航局空域审批', operatorId: 'u002', operatorName: '李星航', action: 'submit', comment: '已报送民航局', timestamp: isoDate(-1, 13) },
    ],
    attachments: ['空域申请函.pdf', '飞行方案.docx'],
  },
  {
    id: 'apr002', slotId: 's004', slotTitle: '盛世华诞·国庆庆典', flowId: 'flow001', flowName: '标准空域审批流程',
    currentNodeOrder: 1, status: 'escalated', submissionTime: isoDate(0, 8),
    timeline: [
      { id: 't004', nodeId: 'n001', nodeName: '内部合规审核', operatorId: 'u003', operatorName: '王鹏程', action: 'submit', comment: '提交国庆庆典审批', timestamp: isoDate(0, 8) },
      { id: 't005', nodeId: 'n001', nodeName: '内部合规审核', operatorId: 'system', operatorName: '系统自动', action: 'remind', comment: '节点超时，自动催办', timestamp: isoDate(0, 12, 5), isTimeout: true },
      { id: 't006', nodeId: 'n001', nodeName: '内部合规审核', operatorId: 'system', operatorName: '系统自动', action: 'escalate', comment: '超时达8小时，自动升级至孙副总', timestamp: isoDate(0, 16, 10), isTimeout: true },
    ],
    attachments: ['大型活动批文.pdf', '安保方案.pdf', '应急预案.pdf'],
  },
  {
    id: 'apr003', slotId: 's001', slotTitle: '星河周年庆·开场灯光秀', flowId: 'flow001', flowName: '标准空域审批流程',
    currentNodeOrder: 4, status: 'approved', submissionTime: isoDate(-7, 11),
    timeline: [
      { id: 't007', nodeId: 'n001', nodeName: '内部合规审核', operatorId: 'u002', operatorName: '李星航', action: 'submit', timestamp: isoDate(-7, 11) },
      { id: 't008', nodeId: 'n001', nodeName: '内部合规审核', operatorId: 'u002', operatorName: '李星航', action: 'approve', comment: '通过', timestamp: isoDate(-7, 13) },
      { id: 't009', nodeId: 'n002', nodeName: '民航局空域审批', operatorId: 'u004', operatorName: '陈空域', action: 'approve', comment: '同意使用该空域', timestamp: isoDate(-5, 9) },
      { id: 't010', nodeId: 'n003', nodeName: '军航管制报备', operatorId: 'u005', operatorName: '刘警戒', action: 'approve', comment: '已报备，无冲突', timestamp: isoDate(-3, 15) },
    ],
    attachments: ['空域申请函.pdf'],
  },
  {
    id: 'apr004', slotId: 's006', slotTitle: '云帆广场开业盛典', flowId: 'flow002', flowName: '简化审批流程(低空空域)',
    currentNodeOrder: 1, status: 'pending', submissionTime: isoDate(0, 11),
    timeline: [
      { id: 't011', nodeId: 'n004', nodeName: '快速审核', operatorId: 'u003', operatorName: '王鹏程', action: 'submit', comment: '商业中心开业表演', timestamp: isoDate(0, 11) },
    ],
    attachments: ['开业活动方案.pdf'],
  },
  {
    id: 'apr005', slotId: 's011', slotTitle: '春日节(已完成)', flowId: 'flow002', flowName: '简化审批流程(低空空域)',
    currentNodeOrder: 3, status: 'approved', submissionTime: isoDate(-12, 10),
    timeline: [
      { id: 't012', nodeId: 'n004', nodeName: '快速审核', operatorId: 'u003', operatorName: '王鹏程', action: 'approve', timestamp: isoDate(-12, 12) },
      { id: 't013', nodeId: 'n005', nodeName: '民航备案', operatorId: 'u004', operatorName: '陈空域', action: 'approve', comment: '已备案', timestamp: isoDate(-10, 15) },
    ],
    attachments: [],
  },
];

export const mockReminders: ReminderRecord[] = [
  { id: 'r001', approvalRequestId: 'apr002', slotTitle: '盛世华诞·国庆庆典', nodeId: 'n001', nodeName: '内部合规审核', assigneeId: 'u002', assigneeName: '李星航', deadline: isoDate(0, 12), reminderTime: isoDate(0, 12, 5), isAuto: true, isEscalation: false, status: 'delivered' },
  { id: 'r002', approvalRequestId: 'apr002', slotTitle: '盛世华诞·国庆庆典', nodeId: 'n001', nodeName: '内部合规审核', assigneeId: 'u002', assigneeName: '李星航', deadline: isoDate(0, 12), reminderTime: isoDate(0, 14, 30), isAuto: true, isEscalation: false, status: 'read' },
  { id: 'r003', approvalRequestId: 'apr002', slotTitle: '盛世华诞·国庆庆典', nodeId: 'n001', nodeName: '内部合规审核', assigneeId: 'u007', assigneeName: '孙副总', deadline: isoDate(0, 12), reminderTime: isoDate(0, 16, 10), isAuto: true, isEscalation: true, status: 'delivered' },
  { id: 'r004', approvalRequestId: 'apr001', slotTitle: '璀璨之夜·城市营销', nodeId: 'n002', nodeName: '民航局空域审批', assigneeId: 'u004', assigneeName: '陈空域', deadline: isoDate(0, 13), reminderTime: isoDate(0, 15, 20), isAuto: false, isEscalation: false, operatorId: 'u006', operatorName: '赵督查', status: 'sent' },
  { id: 'r005', approvalRequestId: 'apr004', slotTitle: '云帆广场开业盛典', nodeId: 'n004', nodeName: '快速审核', assigneeId: 'u003', assigneeName: '王鹏程', deadline: isoDate(0, 13), reminderTime: isoDate(0, 14, 0), isAuto: true, isEscalation: false, status: 'read' },
];

export const mockAirspaceReports: AirspaceReport[] = [
  {
    id: 'air001', slotId: 's001', slotTitle: '星河周年庆·开场灯光秀',
    coordinates: [
      { lat: 39.9389, lng: 116.4812 }, { lat: 39.9410, lng: 116.4861 },
      { lat: 39.9356, lng: 116.4878 }, { lat: 39.9335, lng: 116.4829 },
    ],
    altitudeRange: { min: 100, max: 300 },
    civilAviationStatus: 'approved', militaryAviationStatus: 'approved', reportNumber: 'CAAC-BJ-2026-0620-001',
    documents: [{ name: '空域坐标图.pdf', url: '#', type: 'pdf' }, { name: '飞行安全评估.docx', url: '#', type: 'docx' }],
    createdAt: isoDate(-5, 10),
  },
  {
    id: 'air002', slotId: 's003', slotTitle: '璀璨之夜·城市营销',
    coordinates: [
      { lat: 31.2397, lng: 121.4909 }, { lat: 31.2423, lng: 121.4985 },
      { lat: 31.2365, lng: 121.4998 }, { lat: 31.2339, lng: 121.4922 },
    ],
    altitudeRange: { min: 80, max: 260 },
    civilAviationStatus: 'submitted', militaryAviationStatus: 'pending', reportNumber: 'CAAC-SH-2026-0620-015',
    documents: [{ name: '外滩空域申请.pdf', url: '#', type: 'pdf' }],
    createdAt: isoDate(-1, 14),
  },
  {
    id: 'air003', slotId: 's004', slotTitle: '盛世华诞·国庆庆典',
    coordinates: [
      { lat: 39.9055, lng: 116.3918 }, { lat: 39.9087, lng: 116.4003 },
      { lat: 39.9010, lng: 116.4015 }, { lat: 39.8984, lng: 116.3930 },
    ],
    altitudeRange: { min: 150, max: 500 },
    civilAviationStatus: 'pending', militaryAviationStatus: 'pending',
    documents: [{ name: '重大活动审批表.pdf', url: '#', type: 'pdf' }, { name: '安保方案.pdf', url: '#', type: 'pdf' }, { name: '应急预案.pdf', url: '#', type: 'pdf' }],
    createdAt: isoDate(0, 9),
  },
];

export const mockDashboardStats: DashboardStats = {
  todayPerformances: 3,
  pendingApprovals: 7,
  timeoutWarnings: 2,
  fleetUtilization: 0.73,
  weeklyTrend: [
    { date: '周一', count: 2 }, { date: '周二', count: 3 }, { date: '周三', count: 1 },
    { date: '周四', count: 4 }, { date: '周五', count: 3 }, { date: '周六', count: 5 }, { date: '周日', count: 2 },
  ],
  statusDistribution: [
    { name: '草稿', value: 2 }, { name: '已确认', value: 6 },
    { name: '审批通过', value: 3 }, { name: '已完成', value: 12 }, { name: '已取消', value: 1 },
  ],
  fleetRadarData: [
    { subject: '天狼星一号', value: 85, fullMark: 100 },
    { subject: '北极星二号', value: 92, fullMark: 100 },
    { subject: '织女星三号', value: 70, fullMark: 100 },
    { subject: '参宿四特别', value: 0, fullMark: 100 },
    { subject: '开普勒五号', value: 65, fullMark: 100 },
    { subject: '仙女座六号', value: 78, fullMark: 100 },
  ],
  todaySchedule: [
    { time: '19:00 - 21:30', title: '星河周年庆·开场灯光秀+主秀', status: 'approved', organizer: '星河文化旅游集团' },
    { time: '21:00 - 22:00', title: '璀璨之夜·城市营销', status: 'confirmed', organizer: '璀璨城市营销有限公司' },
  ],
};
