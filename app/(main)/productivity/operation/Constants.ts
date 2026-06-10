import { DropdownOption } from "@/_components/Dropdown/types"

export const SECTION_OPTIONS: DropdownOption[] = [
    {'value': 'SP', 'label': 'Small Parts',},
    {'value': 'B', 'label': 'Back',},
    {'value': 'F', 'label': 'Front',},
    {'value': 'A1', 'label': 'Assembly 1',},
    {'value': 'A2', 'label': 'Assembly 2',},
    {'value': 'FIN', 'label': 'Finishing',},
]

export const CATEGORY_OPTIONS: DropdownOption[] = [
    {'value': 'Hemming', 'label': 'Hemming'},
    {'value': 'Tracing', 'label': 'Tracing'},
    {'value': 'Over Lock', 'label': 'Over Lock'},
    {'value': 'Attach', 'label': 'Attach'},
    {'value': 'Top Stitch', 'label': 'Top Stitch'},
    {'value': 'Press', 'label': 'Press'},
    {'value': 'Set Stitch', 'label': 'Set Stitch'},
    {'value': 'Safety', 'label': 'Safety'},
    {'value': 'Tacking Stitch', 'label': 'Tacking Stitch'},
    {'value': 'Feedo', 'label': 'Feedo'},
    {'value': 'Deco Stitch', 'label': 'Deco Stitch'},
    {'value': 'J Stitch', 'label': 'J Stitch'},
    {'value': 'Clipping', 'label': 'Clipping'},
    {'value': 'Turn Up', 'label': 'Turn Up'},
    {'value': 'Bartack', 'label': 'Bartack'},
    {'value': 'Eyelet', 'label': 'Eyelet'},
    {'value': 'CBE', 'label': 'CBE'},
    {'value': 'Loop', 'label': 'Loop'},
    {'value': 'Matching', 'label': 'Matching'},
    {'value': 'Mock', 'label': 'Mock'},
    {'value': 'Buffer', 'label': 'Buffer'},
]

export const LEVEL_OPTIONS: DropdownOption[] = [
    {'value': '1', 'label': '1'},
    {'value': '2', 'label': '2'},
    {'value': '3', 'label': '3'},
    {'value': '4', 'label': '4'},
]

export const MACHINE_TYPE_OPTIONS: DropdownOption[] = [
    {'value': 'SNLS', 'label': 'Single Needle Lock Stitch',},
    {'value': 'DNLS', 'label': 'Double Needle Lock Stitch',},
    {'value': 'Manu', 'label': 'Manual',},
    {'value': 'OL', 'label': 'Overlock',},
    {'value': 'SFTY', 'label': 'Safety',},
    {'value': 'Feedo', 'label': 'Feed of Arm',},
    {'value': 'BTK', 'label': 'Bartack',},
    {'value': 'Eyelet', 'label': 'Eyelet',},
    {'value': 'WB', 'label': 'Waistband',},
    {'value': 'Loop', 'label': 'Loop Machine',},
    {'value': 'SNCS', 'label': 'Single Needle Chain Stitch',},
    {'value': 'DNCS', 'label': 'Double Needle Chain Stitch',},
    {'value': 'Buffer', 'label': 'Buffer',},
    {'value': 'AutoBone', 'label': 'Auto Bone',},
    {'value': 'CoverStitch', 'label': 'Cover Stitch',},
    {'value': 'Flat', 'label': 'Flat Lock',},
    {'value': 'Plotter', 'label': 'Plotter',},
    {'value': 'Template', 'label': 'Template',},
    {'value': 'ZigZag', 'label': 'Zig Zag',},
]

export const SAM_FACTOR = [
    {level: 1, factor: 4.25},
    {level: 2, factor: 3.85},
    {level: 3, factor: 3.21},
    {level: 4, factor: 2.80},
]