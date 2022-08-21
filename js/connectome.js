/*
The Connectome of C. Elegans!

The following is essentially a port of the Raspberry Pi robot implementation of the OpenWorm connectome, created by Timothy Busbice, Gabriel Garrett, and Geoffrey Churchill in 2014.
Their program was published under a GPLv2 license, this is under GPLv3.

This program is *really* strange. For one, the implementation of the synapse weights is extremely unusual and I'm sure there's a good chance you'll find all the eval()s very painful to look at.
Obviously, there are generally far better ways to store a weighted directed graph and just generally implement this in a more pleasant way.
I think it's possible that the original authors wrote this program in this peculiar way in order to make things more comprehensible from an educational POV.
Even then, there's no excuse for the way some of this is written.
Because I've just reimplemented it in JS, I don't think there's much point taking this particular program very seriously.
I primarily chose to use this due to its extreme simplicity and because it's lightweight. It also very easily lended itself to porting and implementation on the site.
I'd recommend checking out the original OpenWorm project and seeing the many other really cool implementations.
*/

// Neuronal state variables:
var tempState = 0;
var thisState = 0;
var nextState = 1;

// Neuron firing thershold:
var threshold = 30;

// Variables to store speed and accumulated velocities:
var accumleft = 0;
var accumright = 0;
var new_speed = 80;

// A list of muscles:
var muscles = ["MVU", "MVL", "MDL", "MVR", "MDR"];
var muscleList = ["MDL07", "MDL08", "MDL09", "MDL10", "MDL11", "MDL12", "MDL13", "MDL14", "MDL15", "MDL16", "MDL17", "MDL18", "MDL19", "MDL20", "MDL21", "MDL22", "MDL23", "MVL07", "MVL08", "MVL09", "MVL10", "MVL11", "MVL12", "MVL13", "MVL14", "MVL15", "MVL16", "MVL17", "MVL18", "MVL19", "MVL20", "MVL21", "MVL22", "MVL23", "MDR07", "MDR08", "MDR09", "MDR10", "MDR11", "MDR12", "MDR13", "MDR14", "MDR15", "MDR16", "MDR17", "MDR18", "MDR19", "MDR20", "MDL21", "MDR22", "MDR23", "MVR07", "MVR08", "MVR09", "MVR10", "MVR11", "MVR12", "MVR13", "MVR14", "MVR15", "MVR16", "MVR17", "MVR18", "MVR19", "MVR20", "MVL21", "MVR22", "MVR23"];

// Arrays of muscles corresponding to "left" and "right" movements:
var mLeft = ["MDL07", "MDL08", "MDL09", "MDL10", "MDL11", "MDL12", "MDL13", "MDL14", "MDL15", "MDL16", "MDL17", "MDL18", "MDL19", "MDL20", "MDL21", "MDL22", "MDL23", "MVL07", "MVL08", "MVL09", "MVL10", "MVL11", "MVL12", "MVL13", "MVL14", "MVL15", "MVL16", "MVL17", "MVL18", "MVL19", "MVL20", "MVL21", "MVL22", "MVL23"];
var mRight = ["MDR07", "MDR08", "MDR09", "MDR10", "MDR11", "MDR12", "MDR13", "MDR14", "MDR15", "MDR16", "MDR17", "MDR18", "MDR19", "MDR20", "MDL21", "MDR22", "MDR23", "MVR07", "MVR08", "MVR09", "MVR10", "MVR11", "MVR12", "MVR13", "MVR14", "MVR15", "MVR16", "MVR17", "MVR18", "MVR19", "MVR20", "MVL21", "MVR22", "MVR23"];

var musDleft = ["MDL07", "MDL08", "MDL09", "MDL10", "MDL11", "MDL12", "MDL13", "MDL14", "MDL15", "MDL16", "MDL17", "MDL18", "MDL19", "MDL20", "MDL21", "MDL22", "MDL23"];
var musVleft = ["MVL07", "MVL08", "MVL09", "MVL10", "MVL11", "MVL12", "MVL13", "MVL14", "MVL15", "MVL16", "MVL17", "MVL18", "MVL19", "MVL20", "MVL21", "MVL22", "MVL23"];
var musDright = ["MDR07", "MDR08", "MDR09", "MDR10", "MDR11", "MDR12", "MDR13", "MDR14", "MDR15", "MDR16", "MDR17", "MDR18", "MDR19", "MDR20", "MDL21", "MDR22", "MDR23"];
var musVright = ["MVR07", "MVR08", "MVR09", "MVR10", "MVR11", "MVR12", "MVR13", "MVR14", "MVR15", "MVR16", "MVR17", "MVR18", "MVR19", "MVR20", "MVL21", "MVR22", "MVR23"];

// A list of all the neurons and sensory stuff and muscles:
var neurons = ["ADAL", "ADAR", "ADEL", "ADER", "ADFL", "ADFR", "ADLL", "ADLR", "AFDL", "AFDR", "AIAL", "AIAR", "AIBL", "AIBR", "AIML", "AIMR", "AINL", "AINR", "AIYL", "AIYR", "AIZL", "AIZR", "ALA", "ALML", "ALMR", "ALNL", "ALNR", "AQR", "AS1", "AS10", "AS11", "AS2", "AS3", "AS4", "AS5", "AS6", "AS7", "AS8", "AS9", "ASEL", "ASER", "ASGL", "ASGR", "ASHL", "ASHR", "ASIL", "ASIR", "ASJL", "ASJR", "ASKL", "ASKR", "AUAL", "AUAR", "AVAL", "AVAR", "AVBL", "AVBR", "AVDL", "AVDR", "AVEL", "AVER", "AVFL", "AVFR", "AVG", "AVHL", "AVHR", "AVJL", "AVJR", "AVKL", "AVKR", "AVL", "AVM", "AWAL", "AWAR", "AWBL", "AWBR", "AWCL", "AWCR", "BAGL", "BAGR", "BDUL", "BDUR", "CEPDL", "CEPDR", "CEPVL", "CEPVR", "DA1", "DA2", "DA3", "DA4", "DA5", "DA6", "DA7", "DA8", "DA9", "DB1", "DB2", "DB3", "DB4", "DB5", "DB6", "DB7", "DD1", "DD2", "DD3", "DD4", "DD5", "DD6", "DVA", "DVB", "DVC", "FLPL", "FLPR", "HSNL", "HSNR", "I1L", "I1R", "I2L", "I2R", "I3", "I4", "I5", "I6", "IL1DL", "IL1DR", "IL1L", "IL1R", "IL1VL", "IL1VR", "IL2L", "IL2R", "IL2DL", "IL2DR", "IL2VL", "IL2VR", "LUAL", "LUAR", "M1", "M2L", "M2R", "M3L", "M3R", "M4", "M5", "MANAL", "MCL", "MCR", "MDL01", "MDL02", "MDL03", "MDL04", "MDL05", "MDL06", "MDL07", "MDL08", "MDL09", "MDL10", "MDL11", "MDL12", "MDL13", "MDL14", "MDL15", "MDL16", "MDL17", "MDL18", "MDL19", "MDL20", "MDL21", "MDL22", "MDL23", "MDL24", "MDR01", "MDR02", "MDR03", "MDR04", "MDR05", "MDR06", "MDR07", "MDR08", "MDR09", "MDR10", "MDR11", "MDR12", "MDR13", "MDR14", "MDR15", "MDR16", "MDR17", "MDR18", "MDR19", "MDR20", "MDR21", "MDR22", "MDR23", "MDR24", "MI", "MVL01", "MVL02", "MVL03", "MVL04", "MVL05", "MVL06", "MVL07", "MVL08", "MVL09", "MVL10", "MVL11", "MVL12", "MVL13", "MVL14", "MVL15", "MVL16", "MVL17", "MVL18", "MVL19", "MVL20", "MVL21", "MVL22", "MVL23", "MVR01", "MVR02", "MVR03", "MVR04", "MVR05", "MVR06", "MVR07", "MVR08", "MVR09", "MVR10", "MVR11", "MVR12", "MVR13", "MVR14", "MVR15", "MVR16", "MVR17", "MVR18", "MVR19", "MVR20", "MVR21", "MVR22", "MVR23", "MVR24", "MVULVA", "NSML", "NSMR", "OLLL", "OLLR", "OLQDL", "OLQDR", "OLQVL", "OLQVR", "PDA", "PDB", "PDEL", "PDER", "PHAL", "PHAR", "PHBL", "PHBR", "PHCL", "PHCR", "PLML", "PLMR", "PLNL", "PLNR", "PQR", "PVCL", "PVCR", "PVDL", "PVDR", "PVM", "PVNL", "PVNR", "PVPL", "PVPR", "PVQL", "PVQR", "PVR", "PVT", "PVWL", "PVWR", "RIAL", "RIAR", "RIBL", "RIBR", "RICL", "RICR", "RID", "RIFL", "RIFR", "RIGL", "RIGR", "RIH", "RIML", "RIMR", "RIPL", "RIPR", "RIR", "RIS", "RIVL", "RIVR", "RMDDL", "RMDDR", "RMDL", "RMDR", "RMDVL", "RMDVR", "RMED", "RMEL", "RMER", "RMEV", "RMFL", "RMFR", "RMGL", "RMGR", "RMHL", "RMHR", "SAADL", "SAADR", "SAAVL", "SAAVR", "SABD", "SABVL", "SABVR", "SDQL", "SDQR", "SIADL", "SIADR", "SIAVL", "SIAVR", "SIBDL", "SIBDR", "SIBVL", "SIBVR", "SMBDL", "SMBDR", "SMBVL", "SMBVR", "SMDDL", "SMDDR", "SMDVL", "SMDVR", "URADL", "URADR", "URAVL", "URAVR", "URBL", "URBR", "URXL", "URXR", "URYDL", "URYDR", "URYVL", "URYVR", "VA1", "VA10", "VA11", "VA12", "VA2", "VA3", "VA4", "VA5", "VA6", "VA7", "VA8", "VA9", "VB1", "VB10", "VB11", "VB2", "VB3", "VB4", "VB5", "VB6", "VB7", "VB8", "VB9", "VC1", "VC2", "VC3", "VC4", "VC5", "VC6", "VD1", "VD10", "VD11", "VD12", "VD13", "VD2", "VD3", "VD4", "VD5", "VD6", "VD7", "VD8", "VD9"];

// Create an array called postSynaptic, which stores the states of each of the neurons:
var postSynaptic = new Array(neurons.length);
for (var i = 0; i < postSynaptic.length; i++) {
  postSynaptic[i] = [0, 0];
}

// A large list of functions defining how the voltage of postsynaptic neurons change upon the firing of a given neuron:

function ADAL() {
    postSynaptic[neurons.indexOf('ADAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('ADFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 5;
    postSynaptic[neurons.indexOf('FLPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVQL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 2;
}

function ADAR() {
    postSynaptic[neurons.indexOf('ADAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ADFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 2;
}

function ADEL() {
    postSynaptic[neurons.indexOf('ADAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ADER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AINL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('BDUL')][nextState] += 1;
    postSynaptic[neurons.indexOf('CEPDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('FLPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1L')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL2L')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL05')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLLL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIADR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URBL')][nextState] += 1;
}

function ADER() {
    postSynaptic[neurons.indexOf('ADAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ADEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('ALA')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 1;
    postSynaptic[neurons.indexOf('CEPDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('FLPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('FLPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLLR')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 7;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SAAVR')][nextState] += 1;
}

function ADFL() {
    postSynaptic[neurons.indexOf('ADAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 12;
    postSynaptic[neurons.indexOf('AUAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('OLQVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 15;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMBVL')][nextState] += 2;
}

function ADFR() {
    postSynaptic[neurons.indexOf('ADAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIYR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 8;
    postSynaptic[neurons.indexOf('ASHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AUAR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AWBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 16;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIR')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('URXR')][nextState] += 1;
}

function ADLL() {
    postSynaptic[neurons.indexOf('ADLR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 6;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 7;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ALA')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASER')][nextState] += 3;
    postSynaptic[neurons.indexOf('ASHL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AWBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('OLQVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 1;
}

function ADLR() {
    postSynaptic[neurons.indexOf('ADLL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 10;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 10;
    postSynaptic[neurons.indexOf('ASER')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWCR')][nextState] += 3;
    postSynaptic[neurons.indexOf('OLLR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 1;
}

function AFDL() {
    postSynaptic[neurons.indexOf('AFDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AINR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIYL')][nextState] += 7;
}

function AFDR() {
    postSynaptic[neurons.indexOf('AFDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIYR')][nextState] += 13;
    postSynaptic[neurons.indexOf('ASER')][nextState] += 1;
}

function AIAL() {
    postSynaptic[neurons.indexOf('ADAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 10;
    postSynaptic[neurons.indexOf('AIML')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASER')][nextState] += 3;
    postSynaptic[neurons.indexOf('ASGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASIL')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASKL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AWAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 1;
}

function AIAR() {
    postSynaptic[neurons.indexOf('ADAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ADFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ADLR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 14;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASER')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASIR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AWAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AWCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWCR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIFR')][nextState] += 2;
}

function AIBL() {
    postSynaptic[neurons.indexOf('AFDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIYL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 5;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 1;
    postSynaptic[neurons.indexOf('FLPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 13;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAADL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SAADR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 4;
}

function AIBR() {
    postSynaptic[neurons.indexOf('AFDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 16;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAADL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB1')][nextState] += 3;
}

function AIML() {
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('ALML')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASGL')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASKL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVHL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVQL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBVL')][nextState] += 1;
}

function AIMR() {
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 5;
    postSynaptic[neurons.indexOf('ASGR')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASJR')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASKR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 2;
    postSynaptic[neurons.indexOf('OLQDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMGR')][nextState] += 1;
}

function AINL() {
    postSynaptic[neurons.indexOf('ADEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AFDR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AINR')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASEL')][nextState] += 3;
    postSynaptic[neurons.indexOf('ASGR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AUAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('BAGL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 2;
}

function AINR() {
    postSynaptic[neurons.indexOf('AFDL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AFDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AINL')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASER')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AUAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AUAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('BAGR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RID')][nextState] += 1;
}

function AIYL() {
    postSynaptic[neurons.indexOf('AIYR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 13;
    postSynaptic[neurons.indexOf('AWAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AWCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 7;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 1;
}

function AIYR() {
    postSynaptic[neurons.indexOf('ADFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIYL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 8;
    postSynaptic[neurons.indexOf('AWAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 6;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 1;
}

function AIZL() {
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 8;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 5;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 8;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 4;
    postSynaptic[neurons.indexOf('SMBDL')][nextState] += 9;
    postSynaptic[neurons.indexOf('SMBVL')][nextState] += 7;
    postSynaptic[neurons.indexOf('VB2')][nextState] += 1;
}

function AIZR() {
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 8;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 7;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 4;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 5;
    postSynaptic[neurons.indexOf('SMBVR')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 1;
}

function ALA() {
    postSynaptic[neurons.indexOf('ADEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('RID')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 1;
}

function ALML() {
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVM')][nextState] += 1;
    postSynaptic[neurons.indexOf('BDUL')][nextState] += 6;
    postSynaptic[neurons.indexOf('CEPDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('CEPVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SDQL')][nextState] += 1;
}

function ALMR() {
    postSynaptic[neurons.indexOf('AVM')][nextState] += 1;
    postSynaptic[neurons.indexOf('BDUR')][nextState] += 5;
    postSynaptic[neurons.indexOf('CEPDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('CEPVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIADL')][nextState] += 1;
}

function ALNL() {
    postSynaptic[neurons.indexOf('SAAVL')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 1;
}

function ALNR() {
    postSynaptic[neurons.indexOf('ADER')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAAVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMBDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 1;
}

function AQR() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 1;
    postSynaptic[neurons.indexOf('BAGL')][nextState] += 2;
    postSynaptic[neurons.indexOf('BAGR')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 7;
    postSynaptic[neurons.indexOf('PVPR')][nextState] += 9;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URXL')][nextState] += 1;
}

function AS1() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA1')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL05')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL08')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR05')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR08')][nextState] += 4;
    postSynaptic[neurons.indexOf('VA3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 5;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 1;
}

function AS2() {
    postSynaptic[neurons.indexOf('DA2')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL07')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL08')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR07')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR08')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA4')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 10;
}

function AS3() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA2')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA3')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL09')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL10')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR09')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR10')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA5')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 15;
}

function AS4() {
    postSynaptic[neurons.indexOf('AS5')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA3')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL11')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL12')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR11')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR12')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 11;
}

function AS5() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL11')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL14')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR11')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR14')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA7')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 9;
}

function AS6() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA5')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL13')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL14')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR13')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR14')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA8')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD6')][nextState] += 13;
}

function AS7() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL13')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL16')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR13')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR16')][nextState] += 3;
}

function AS8() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL15')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL18')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR15')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR18')][nextState] += 3;
}

function AS9() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DVB')][nextState] += 7;
    postSynaptic[neurons.indexOf('MDL17')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL20')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR17')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR20')][nextState] += 3;
}

function AS10() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL19')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL20')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR19')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR20')][nextState] += 2;
}

function AS11() {
    postSynaptic[neurons.indexOf('MDL21')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL22')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL23')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL24')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR21')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR22')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR23')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR24')][nextState] += 1;
    postSynaptic[neurons.indexOf('PDA')][nextState] += 1;
    postSynaptic[neurons.indexOf('PDB')][nextState] += 1;
    postSynaptic[neurons.indexOf('PDB')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD13')][nextState] += 2;
}

function ASEL() {
    postSynaptic[neurons.indexOf('ADFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 7;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIYL')][nextState] += 13;
    postSynaptic[neurons.indexOf('AIYR')][nextState] += 6;
    postSynaptic[neurons.indexOf('AWCL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AWCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 1;
}

function ASER() {
    postSynaptic[neurons.indexOf('AFDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AFDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 10;
    postSynaptic[neurons.indexOf('AIYL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIYR')][nextState] += 14;
    postSynaptic[neurons.indexOf('AWAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWCR')][nextState] += 1;
}

function ASGL() {
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 9;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AINR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASKL')][nextState] += 1;
}

function ASGR() {
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 10;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AINL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIYR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 1;
}

function ASHL() {
    postSynaptic[neurons.indexOf('ADAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('ADFL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 7;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 1;
}

function ASHR() {
    postSynaptic[neurons.indexOf('ADAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('ADFR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 10;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASKR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 3;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMGR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMGR')][nextState] += 1;
}

function ASIL() {
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIYL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASER')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASIR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASKL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AWCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
}

function ASIR() {
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASIL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWCR')][nextState] += 1;
}

function ASJL() {
    postSynaptic[neurons.indexOf('ASJR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASKL')][nextState] += 4;
    postSynaptic[neurons.indexOf('HSNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVQL')][nextState] += 14;
}

function ASJR() {
    postSynaptic[neurons.indexOf('ASJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASKR')][nextState] += 4;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVQR')][nextState] += 13;
}

function ASKL() {
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 11;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIML')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASKR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVQL')][nextState] += 5;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 1;
}

function ASKR() {
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 11;
    postSynaptic[neurons.indexOf('AIMR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('CEPVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVQR')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMGR')][nextState] += 1;
}

function AUAL() {
    postSynaptic[neurons.indexOf('AINR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AUAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AWBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 9;
}

function AUAR() {
    postSynaptic[neurons.indexOf('AINL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIYR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AUAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 4;
    postSynaptic[neurons.indexOf('AWBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 6;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 13;
    postSynaptic[neurons.indexOf('URXR')][nextState] += 1;
}

function AVAL() {
    postSynaptic[neurons.indexOf('AS1')][nextState] += 3;
    postSynaptic[neurons.indexOf('AS10')][nextState] += 3;
    postSynaptic[neurons.indexOf('AS11')][nextState] += 4;
    postSynaptic[neurons.indexOf('AS2')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS3')][nextState] += 3;
    postSynaptic[neurons.indexOf('AS4')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS5')][nextState] += 4;
    postSynaptic[neurons.indexOf('AS6')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS7')][nextState] += 14;
    postSynaptic[neurons.indexOf('AS8')][nextState] += 9;
    postSynaptic[neurons.indexOf('AS9')][nextState] += 12;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA1')][nextState] += 4;
    postSynaptic[neurons.indexOf('DA2')][nextState] += 4;
    postSynaptic[neurons.indexOf('DA3')][nextState] += 6;
    postSynaptic[neurons.indexOf('DA4')][nextState] += 10;
    postSynaptic[neurons.indexOf('DA5')][nextState] += 8;
    postSynaptic[neurons.indexOf('DA6')][nextState] += 21;
    postSynaptic[neurons.indexOf('DA7')][nextState] += 4;
    postSynaptic[neurons.indexOf('DA8')][nextState] += 4;
    postSynaptic[neurons.indexOf('DA9')][nextState] += 3;
    postSynaptic[neurons.indexOf('DB5')][nextState] += 2;
    postSynaptic[neurons.indexOf('DB6')][nextState] += 4;
    postSynaptic[neurons.indexOf('FLPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('LUAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 12;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 11;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 3;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 4;
    postSynaptic[neurons.indexOf('SABVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SDQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URYDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('URYVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA1')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA10')][nextState] += 6;
    postSynaptic[neurons.indexOf('VA11')][nextState] += 7;
    postSynaptic[neurons.indexOf('VA12')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA2')][nextState] += 5;
    postSynaptic[neurons.indexOf('VA3')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA4')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA5')][nextState] += 8;
    postSynaptic[neurons.indexOf('VA6')][nextState] += 10;
    postSynaptic[neurons.indexOf('VA7')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA8')][nextState] += 19;
    postSynaptic[neurons.indexOf('VA9')][nextState] += 8;
    postSynaptic[neurons.indexOf('VB9')][nextState] += 5;
}

function AVAR() {
    postSynaptic[neurons.indexOf('ADER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS1')][nextState] += 3;
    postSynaptic[neurons.indexOf('AS10')][nextState] += 2;
    postSynaptic[neurons.indexOf('AS11')][nextState] += 6;
    postSynaptic[neurons.indexOf('AS2')][nextState] += 2;
    postSynaptic[neurons.indexOf('AS3')][nextState] += 2;
    postSynaptic[neurons.indexOf('AS4')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS5')][nextState] += 2;
    postSynaptic[neurons.indexOf('AS6')][nextState] += 3;
    postSynaptic[neurons.indexOf('AS7')][nextState] += 8;
    postSynaptic[neurons.indexOf('AS8')][nextState] += 9;
    postSynaptic[neurons.indexOf('AS9')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA1')][nextState] += 8;
    postSynaptic[neurons.indexOf('DA2')][nextState] += 4;
    postSynaptic[neurons.indexOf('DA3')][nextState] += 5;
    postSynaptic[neurons.indexOf('DA4')][nextState] += 8;
    postSynaptic[neurons.indexOf('DA5')][nextState] += 7;
    postSynaptic[neurons.indexOf('DA6')][nextState] += 13;
    postSynaptic[neurons.indexOf('DA7')][nextState] += 3;
    postSynaptic[neurons.indexOf('DA8')][nextState] += 9;
    postSynaptic[neurons.indexOf('DA9')][nextState] += 2;
    postSynaptic[neurons.indexOf('DB3')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB5')][nextState] += 3;
    postSynaptic[neurons.indexOf('DB6')][nextState] += 5;
    postSynaptic[neurons.indexOf('LUAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('LUAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('PDEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PDER')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 7;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 8;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABVL')][nextState] += 6;
    postSynaptic[neurons.indexOf('SABVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URYDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URYVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA10')][nextState] += 5;
    postSynaptic[neurons.indexOf('VA11')][nextState] += 15;
    postSynaptic[neurons.indexOf('VA12')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA2')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA3')][nextState] += 7;
    postSynaptic[neurons.indexOf('VA4')][nextState] += 5;
    postSynaptic[neurons.indexOf('VA5')][nextState] += 4;
    postSynaptic[neurons.indexOf('VA6')][nextState] += 5;
    postSynaptic[neurons.indexOf('VA7')][nextState] += 4;
    postSynaptic[neurons.indexOf('VA8')][nextState] += 16;
    postSynaptic[neurons.indexOf('VB9')][nextState] += 10;
    postSynaptic[neurons.indexOf('VD13')][nextState] += 2;
}

function AVBL() {
    postSynaptic[neurons.indexOf('AQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS10')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS3')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS4')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS5')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS6')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS7')][nextState] += 2;
    postSynaptic[neurons.indexOf('AS9')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB3')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB5')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB6')][nextState] += 2;
    postSynaptic[neurons.indexOf('DB7')][nextState] += 2;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RID')][nextState] += 1;
    postSynaptic[neurons.indexOf('SDQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA10')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA7')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB1')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB10')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB11')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB2')][nextState] += 4;
    postSynaptic[neurons.indexOf('VB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB5')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB6')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB7')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB8')][nextState] += 7;
    postSynaptic[neurons.indexOf('VB9')][nextState] += 1;
    postSynaptic[neurons.indexOf('VC3')][nextState] += 1;
}

function AVBR() {
    postSynaptic[neurons.indexOf('AS1')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS10')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS3')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS4')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS5')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS6')][nextState] += 2;
    postSynaptic[neurons.indexOf('AS7')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 4;
    postSynaptic[neurons.indexOf('DA5')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB1')][nextState] += 3;
    postSynaptic[neurons.indexOf('DB2')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB3')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB5')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB6')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB7')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVNL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RID')][nextState] += 2;
    postSynaptic[neurons.indexOf('SIBVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA8')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA9')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB10')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB11')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB6')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB7')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB8')][nextState] += 3;
    postSynaptic[neurons.indexOf('VB9')][nextState] += 6;
    postSynaptic[neurons.indexOf('VD10')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 1;
}

function AVDL() {
    postSynaptic[neurons.indexOf('ADAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AS1')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS10')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS11')][nextState] += 2;
    postSynaptic[neurons.indexOf('AS4')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS5')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 13;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 19;
    postSynaptic[neurons.indexOf('AVM')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA2')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA3')][nextState] += 4;
    postSynaptic[neurons.indexOf('DA4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA5')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA8')][nextState] += 1;
    postSynaptic[neurons.indexOf('FLPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('FLPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('LUAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA5')][nextState] += 1;
}

function AVDR() {
    postSynaptic[neurons.indexOf('ADAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('ADLL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS10')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS5')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 16;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 15;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA1')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA2')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA3')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA5')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA8')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 1;
    postSynaptic[neurons.indexOf('FLPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('LUAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABVL')][nextState] += 3;
    postSynaptic[neurons.indexOf('SABVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA11')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA3')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA6')][nextState] += 1;
}

function AVEL() {
    postSynaptic[neurons.indexOf('AS1')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 12;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA1')][nextState] += 5;
    postSynaptic[neurons.indexOf('DA2')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA3')][nextState] += 3;
    postSynaptic[neurons.indexOf('DA4')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 6;
    postSynaptic[neurons.indexOf('SABVL')][nextState] += 7;
    postSynaptic[neurons.indexOf('SABVR')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA1')][nextState] += 5;
    postSynaptic[neurons.indexOf('VA3')][nextState] += 3;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 1;
}

function AVER() {
    postSynaptic[neurons.indexOf('AS1')][nextState] += 3;
    postSynaptic[neurons.indexOf('AS2')][nextState] += 2;
    postSynaptic[neurons.indexOf('AS3')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 16;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA1')][nextState] += 5;
    postSynaptic[neurons.indexOf('DA2')][nextState] += 3;
    postSynaptic[neurons.indexOf('DA3')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB3')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 2;
    postSynaptic[neurons.indexOf('SABVL')][nextState] += 3;
    postSynaptic[neurons.indexOf('SABVR')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA1')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA3')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA5')][nextState] += 1;
}

function AVFL() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVFR')][nextState] += 30;
    postSynaptic[neurons.indexOf('AVG')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVHL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVHR')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL11')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL12')][nextState] += 1;
    postSynaptic[neurons.indexOf('PDER')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVNL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVQL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVQR')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB1')][nextState] += 1;
}

function AVFR() {
    postSynaptic[neurons.indexOf('ASJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 24;
    postSynaptic[neurons.indexOf('AVHL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVHR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL14')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVR14')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVQL')][nextState] += 1;
    postSynaptic[neurons.indexOf('VC4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD11')][nextState] += 1;
}

function AVG() {
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA8')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA11')][nextState] += 1;
}

function AVHL() {
    postSynaptic[neurons.indexOf('ADFR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVFR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVHR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPR')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVQL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVQR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIR')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 1;
}

function AVHR() {
    postSynaptic[neurons.indexOf('ADLL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ADLR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AQR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVHL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 4;
    postSynaptic[neurons.indexOf('PVNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIR')][nextState] += 4;
    postSynaptic[neurons.indexOf('SMBDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBVL')][nextState] += 1;
}

function AVJL() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVHL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 4;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PLMR')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 5;
    postSynaptic[neurons.indexOf('PVNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 2;
}

function AVJR() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 5;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 4;
    postSynaptic[neurons.indexOf('PVQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABVL')][nextState] += 1;
}

function AVKL() {
    postSynaptic[neurons.indexOf('ADER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AQR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVM')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 1;
    postSynaptic[neurons.indexOf('PDEL')][nextState] += 3;
    postSynaptic[neurons.indexOf('PDER')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVM')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 2;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAADR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIAVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB1')][nextState] += 4;
    postSynaptic[neurons.indexOf('VB10')][nextState] += 1;
}

function AVKR() {
    postSynaptic[neurons.indexOf('ADEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 2;
    postSynaptic[neurons.indexOf('BDUL')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL10')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 6;
    postSynaptic[neurons.indexOf('PVQL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAADL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMBVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 2;
}

function AVL() {
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA2')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD6')][nextState] += 2;
    postSynaptic[neurons.indexOf('DVB')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 9;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL10')][nextState] += -5;
    postSynaptic[neurons.indexOf('MVR10')][nextState] += -5;
    postSynaptic[neurons.indexOf('PVM')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVWL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 5;
    postSynaptic[neurons.indexOf('SABVL')][nextState] += 4;
    postSynaptic[neurons.indexOf('SABVR')][nextState] += 3;
    postSynaptic[neurons.indexOf('VD12')][nextState] += 4;
}

function AVM() {
    postSynaptic[neurons.indexOf('ADER')][nextState] += 1;
    postSynaptic[neurons.indexOf('ALML')][nextState] += 1;
    postSynaptic[neurons.indexOf('ALMR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 1;
    postSynaptic[neurons.indexOf('BDUL')][nextState] += 3;
    postSynaptic[neurons.indexOf('BDUR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA1')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 4;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 5;
    postSynaptic[neurons.indexOf('PVNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RID')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA1')][nextState] += 2;
}

function AWAL() {
    postSynaptic[neurons.indexOf('ADAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AFDL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIYL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 10;
    postSynaptic[neurons.indexOf('ASEL')][nextState] += 4;
    postSynaptic[neurons.indexOf('ASGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWBL')][nextState] += 1;
}

function AWAR() {
    postSynaptic[neurons.indexOf('ADFR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AFDR')][nextState] += 7;
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIYR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 7;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASER')][nextState] += 2;
    postSynaptic[neurons.indexOf('AUAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIFR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIR')][nextState] += 2;
}

function AWBL() {
    postSynaptic[neurons.indexOf('ADFL')][nextState] += 9;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 9;
    postSynaptic[neurons.indexOf('AUAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDL')][nextState] += 1;
}

function AWBR() {
    postSynaptic[neurons.indexOf('ADFR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 4;
    postSynaptic[neurons.indexOf('ASGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AUAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AWBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBVR')][nextState] += 1;
}

function AWCL() {
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIYL')][nextState] += 10;
    postSynaptic[neurons.indexOf('ASEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 3;
}

function AWCR() {
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AIYL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AIYR')][nextState] += 9;
    postSynaptic[neurons.indexOf('ASEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWCL')][nextState] += 5;
}

function BAGL() {
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 4;
    postSynaptic[neurons.indexOf('BAGR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 7;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIR')][nextState] += 1;
}

function BAGR() {
    postSynaptic[neurons.indexOf('AIYL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('BAGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIR')][nextState] += 1;
}

function BDUL() {
    postSynaptic[neurons.indexOf('ADEL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVNL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVNR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SAADL')][nextState] += 1;
    postSynaptic[neurons.indexOf('URADL')][nextState] += 1;
}

function BDUR() {
    postSynaptic[neurons.indexOf('ADER')][nextState] += 1;
    postSynaptic[neurons.indexOf('ALMR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 2;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 4;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVNL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SDQL')][nextState] += 1;
    postSynaptic[neurons.indexOf('URADR')][nextState] += 1;
}

function CEPDL() {
    postSynaptic[neurons.indexOf('AVER')][nextState] += 5;
    postSynaptic[neurons.indexOf('IL1DL')][nextState] += 4;
    postSynaptic[neurons.indexOf('OLLL')][nextState] += 2;
    postSynaptic[neurons.indexOf('OLQDL')][nextState] += 6;
    postSynaptic[neurons.indexOf('OLQDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMHR')][nextState] += 4;
    postSynaptic[neurons.indexOf('SIADR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URADL')][nextState] += 2;
    postSynaptic[neurons.indexOf('URBL')][nextState] += 4;
    postSynaptic[neurons.indexOf('URYDL')][nextState] += 2;
}

function CEPDR() {
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 6;
    postSynaptic[neurons.indexOf('BDUR')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1DR')][nextState] += 5;
    postSynaptic[neurons.indexOf('IL1R')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLLR')][nextState] += 8;
    postSynaptic[neurons.indexOf('OLQDR')][nextState] += 5;
    postSynaptic[neurons.indexOf('OLQDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMHL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIADL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URADR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('URYDR')][nextState] += 1;
}

function CEPVL() {
    postSynaptic[neurons.indexOf('ADLL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 3;
    postSynaptic[neurons.indexOf('IL1VL')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL03')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLLL')][nextState] += 4;
    postSynaptic[neurons.indexOf('OLQVL')][nextState] += 6;
    postSynaptic[neurons.indexOf('OLQVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 7;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIAVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('URAVL')][nextState] += 2;
}

function CEPVR() {
    postSynaptic[neurons.indexOf('ASGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 5;
    postSynaptic[neurons.indexOf('IL1VR')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL2VR')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVR04')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLLR')][nextState] += 7;
    postSynaptic[neurons.indexOf('OLQVR')][nextState] += 3;
    postSynaptic[neurons.indexOf('OLQVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMHR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SIAVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('URAVR')][nextState] += 1;
}

function DA1() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 6;
    postSynaptic[neurons.indexOf('DA4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL08')][nextState] += 8;
    postSynaptic[neurons.indexOf('MDR08')][nextState] += 8;
    postSynaptic[neurons.indexOf('SABVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SABVR')][nextState] += 3;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 17;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 1;
}

function DA2() {
    postSynaptic[neurons.indexOf('AS2')][nextState] += 2;
    postSynaptic[neurons.indexOf('AS3')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL07')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL08')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL09')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL10')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR07')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR08')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR09')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR10')][nextState] += 2;
    postSynaptic[neurons.indexOf('SABVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA1')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 11;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 5;
}

function DA3() {
    postSynaptic[neurons.indexOf('AS4')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA4')][nextState] += 2;
    postSynaptic[neurons.indexOf('DB3')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL09')][nextState] += 5;
    postSynaptic[neurons.indexOf('MDL10')][nextState] += 5;
    postSynaptic[neurons.indexOf('MDL12')][nextState] += 5;
    postSynaptic[neurons.indexOf('MDR09')][nextState] += 5;
    postSynaptic[neurons.indexOf('MDR10')][nextState] += 5;
    postSynaptic[neurons.indexOf('MDR12')][nextState] += 5;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 25;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 6;
}

function DA4() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA3')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB3')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL11')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL12')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL14')][nextState] += 5;
    postSynaptic[neurons.indexOf('MDR11')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR12')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR14')][nextState] += 5;
    postSynaptic[neurons.indexOf('VB6')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 12;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 15;
}

function DA5() {
    postSynaptic[neurons.indexOf('AS6')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 5;
    postSynaptic[neurons.indexOf('DB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL13')][nextState] += 5;
    postSynaptic[neurons.indexOf('MDL14')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR13')][nextState] += 5;
    postSynaptic[neurons.indexOf('MDR14')][nextState] += 4;
    postSynaptic[neurons.indexOf('VA4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA5')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD6')][nextState] += 16;
}

function DA6() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 10;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL11')][nextState] += 6;
    postSynaptic[neurons.indexOf('MDL12')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL13')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL14')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL16')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR11')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR12')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR13')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR14')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR16')][nextState] += 4;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 4;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 3;
    postSynaptic[neurons.indexOf('VD6')][nextState] += 3;
}

function DA7() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL15')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL17')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL18')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR15')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR17')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR18')][nextState] += 4;
}

function DA8() {
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL17')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL19')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL20')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR17')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR19')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR20')][nextState] += 4;
}

function DA9() {
    postSynaptic[neurons.indexOf('DA8')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD6')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL19')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL21')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL22')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL23')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL24')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR19')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR21')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR22')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR23')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR24')][nextState] += 4;
    postSynaptic[neurons.indexOf('PDA')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RID')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD13')][nextState] += 1;
}

function DB1() {
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS1')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS2')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS3')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 3;
    postSynaptic[neurons.indexOf('DB2')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 10;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL07')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL08')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR07')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR08')][nextState] += 1;
    postSynaptic[neurons.indexOf('RID')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 21;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 15;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 1;
}

function DB2() {
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA3')][nextState] += 5;
    postSynaptic[neurons.indexOf('DB1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB3')][nextState] += 6;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL09')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL10')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL11')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL12')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR09')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR10')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR11')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR12')][nextState] += 3;
    postSynaptic[neurons.indexOf('VB1')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 23;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 14;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 1;
}

function DB3() {
    postSynaptic[neurons.indexOf('AS4')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS5')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB2')][nextState] += 6;
    postSynaptic[neurons.indexOf('DB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 4;
    postSynaptic[neurons.indexOf('DD3')][nextState] += 10;
    postSynaptic[neurons.indexOf('MDL11')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL12')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL13')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDL14')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR11')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR12')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR13')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR14')][nextState] += 3;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 9;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 26;
    postSynaptic[neurons.indexOf('VD6')][nextState] += 7;
}

function DB4() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB3')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD3')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL13')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL14')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL16')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR13')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR14')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR16')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD6')][nextState] += 13;
}

function DB5() {
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL15')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL17')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL18')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR15')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR17')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR18')][nextState] += 2;
}

function DB6() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL17')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL19')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL20')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR17')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR19')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR20')][nextState] += 2;
}

function DB7() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL19')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL21')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL22')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL23')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL24')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR19')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR21')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR22')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR23')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR24')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD13')][nextState] += 2;
}

function DD1() {
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL07')][nextState] += -6;
    postSynaptic[neurons.indexOf('MDL08')][nextState] += -6;
    postSynaptic[neurons.indexOf('MDL09')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDL10')][nextState] += -6;
    postSynaptic[neurons.indexOf('MDR07')][nextState] += -6;
    postSynaptic[neurons.indexOf('MDR08')][nextState] += -6;
    postSynaptic[neurons.indexOf('MDR09')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR10')][nextState] += -6;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 4;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 2;
}

function DD2() {
    postSynaptic[neurons.indexOf('DA3')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD3')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL09')][nextState] += -6;
    postSynaptic[neurons.indexOf('MDL11')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDL12')][nextState] += -6;
    postSynaptic[neurons.indexOf('MDR09')][nextState] += -6;
    postSynaptic[neurons.indexOf('MDR11')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR12')][nextState] += -6;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 3;
}

function DD3() {
    postSynaptic[neurons.indexOf('DD2')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD4')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL11')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDL13')][nextState] += -9;
    postSynaptic[neurons.indexOf('MDL14')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR11')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR13')][nextState] += -9;
    postSynaptic[neurons.indexOf('MDR14')][nextState] += -7;
}

function DD4() {
    postSynaptic[neurons.indexOf('DD3')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL13')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDL15')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDL16')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR13')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR15')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR16')][nextState] += -7;
    postSynaptic[neurons.indexOf('VC3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD8')][nextState] += 1;
}

function DD5() {
    postSynaptic[neurons.indexOf('MDL17')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDL18')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDL20')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR17')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR18')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR20')][nextState] += -7;
    postSynaptic[neurons.indexOf('VB8')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD10')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD9')][nextState] += 1;
}

function DD6() {
    postSynaptic[neurons.indexOf('MDL19')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDL21')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDL22')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDL23')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDL24')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR19')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR21')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR22')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR23')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDR24')][nextState] += -7;
}

function DVA() {
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AQR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AUAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AUAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 9;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 5;
    postSynaptic[neurons.indexOf('DB1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB2')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB3')][nextState] += 2;
    postSynaptic[neurons.indexOf('DB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB5')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB6')][nextState] += 2;
    postSynaptic[neurons.indexOf('DB7')][nextState] += 1;
    postSynaptic[neurons.indexOf('PDEL')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVR')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIR')][nextState] += 3;
    postSynaptic[neurons.indexOf('SAADR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAAVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAAVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMBVL')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMBVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA12')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB1')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB11')][nextState] += 2;
}

function DVB() {
    postSynaptic[neurons.indexOf('AS9')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA8')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD6')][nextState] += 3;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 3;
    postSynaptic[neurons.indexOf('PDA')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB9')][nextState] += 1;
}

function DVC() {
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 9;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVPR')][nextState] += 13;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 5;
    postSynaptic[neurons.indexOf('RMFL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMFR')][nextState] += 4;
    postSynaptic[neurons.indexOf('VA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 5;
    postSynaptic[neurons.indexOf('VD10')][nextState] += 4;
}

function FLPL() {
    postSynaptic[neurons.indexOf('ADEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('ADER')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 15;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 17;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 13;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 1;
    postSynaptic[neurons.indexOf('FLPR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 1;
}

function FLPR() {
    postSynaptic[neurons.indexOf('ADER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 12;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 10;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 1;
    postSynaptic[neurons.indexOf('FLPL')][nextState] += 4;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB1')][nextState] += 1;
}

function HSNL() {
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHR')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASJR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 3;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVULVA')][nextState] += 7;
    postSynaptic[neurons.indexOf('RIFL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 2;
    postSynaptic[neurons.indexOf('SABVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('VC5')][nextState] += 3;
}

function HSNR() {
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS5')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('BDUR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA5')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA6')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNL')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVULVA')][nextState] += 6;
    postSynaptic[neurons.indexOf('PVNR')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIFR')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 1;
    postSynaptic[neurons.indexOf('SABVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA6')][nextState] += 1;
    postSynaptic[neurons.indexOf('VC2')][nextState] += 3;
    postSynaptic[neurons.indexOf('VC3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 2;
}

function I1L() {
    postSynaptic[neurons.indexOf('I1R')][nextState] += 1;
    postSynaptic[neurons.indexOf('I3')][nextState] += 1;
    postSynaptic[neurons.indexOf('I5')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 1;
}

function I1R() {
    postSynaptic[neurons.indexOf('I1L')][nextState] += 1;
    postSynaptic[neurons.indexOf('I3')][nextState] += 1;
    postSynaptic[neurons.indexOf('I5')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 1;
}

function I2L() {
    postSynaptic[neurons.indexOf('I1L')][nextState] += 1;
    postSynaptic[neurons.indexOf('I1R')][nextState] += 1;
    postSynaptic[neurons.indexOf('M1')][nextState] += 4;
}

function I2R() {
    postSynaptic[neurons.indexOf('I1L')][nextState] += 1;
    postSynaptic[neurons.indexOf('I1R')][nextState] += 1;
    postSynaptic[neurons.indexOf('M1')][nextState] += 4;
}

function I3() {
    postSynaptic[neurons.indexOf('M1')][nextState] += 4;
    postSynaptic[neurons.indexOf('M2L')][nextState] += 2;
    postSynaptic[neurons.indexOf('M2R')][nextState] += 2;
}

function I4() {
    postSynaptic[neurons.indexOf('I2L')][nextState] += 5;
    postSynaptic[neurons.indexOf('I2R')][nextState] += 5;
    postSynaptic[neurons.indexOf('I5')][nextState] += 2;
    postSynaptic[neurons.indexOf('M1')][nextState] += 4;
}

function I5() {
    postSynaptic[neurons.indexOf('I1L')][nextState] += 4;
    postSynaptic[neurons.indexOf('I1R')][nextState] += 3;
    postSynaptic[neurons.indexOf('M1')][nextState] += 2;
    postSynaptic[neurons.indexOf('M5')][nextState] += 2;
    postSynaptic[neurons.indexOf('MI')][nextState] += 4;
}

function I6() {
    postSynaptic[neurons.indexOf('I2L')][nextState] += 2;
    postSynaptic[neurons.indexOf('I2R')][nextState] += 2;
    postSynaptic[neurons.indexOf('I3')][nextState] += 1;
    postSynaptic[neurons.indexOf('M4')][nextState] += 1;
    postSynaptic[neurons.indexOf('M5')][nextState] += 2;
    postSynaptic[neurons.indexOf('NSML')][nextState] += 2;
    postSynaptic[neurons.indexOf('NSMR')][nextState] += 2;
}

function IL1DL() {
    postSynaptic[neurons.indexOf('IL1DR')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1L')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL02')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL04')][nextState] += 2;
    postSynaptic[neurons.indexOf('OLLL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 1;
    postSynaptic[neurons.indexOf('URYDL')][nextState] += 1;
}

function IL1DR() {
    postSynaptic[neurons.indexOf('IL1DL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1R')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR01')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR02')][nextState] += 3;
    postSynaptic[neurons.indexOf('OLLR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 5;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 5;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 1;
}

function IL1L() {
    postSynaptic[neurons.indexOf('AVER')][nextState] += 2;
    postSynaptic[neurons.indexOf('IL1DL')][nextState] += 2;
    postSynaptic[neurons.indexOf('IL1VL')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL01')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL03')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL05')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVL01')][nextState] += 3;
    postSynaptic[neurons.indexOf('MVL03')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 5;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 1;
}

function IL1R() {
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1DR')][nextState] += 2;
    postSynaptic[neurons.indexOf('IL1VR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR01')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR03')][nextState] += 3;
    postSynaptic[neurons.indexOf('MVR01')][nextState] += 3;
    postSynaptic[neurons.indexOf('MVR03')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('URXR')][nextState] += 2;
}

function IL1VL() {
    postSynaptic[neurons.indexOf('IL1L')][nextState] += 2;
    postSynaptic[neurons.indexOf('IL1VR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL01')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL02')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 5;
    postSynaptic[neurons.indexOf('RMED')][nextState] += 1;
    postSynaptic[neurons.indexOf('URYVL')][nextState] += 1;
}

function IL1VR() {
    postSynaptic[neurons.indexOf('IL1R')][nextState] += 2;
    postSynaptic[neurons.indexOf('IL1VL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL2R')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL2VR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR01')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR02')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 6;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 10;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 1;
}

function IL2DL() {
    postSynaptic[neurons.indexOf('AUAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1DL')][nextState] += 7;
    postSynaptic[neurons.indexOf('OLQDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 10;
    postSynaptic[neurons.indexOf('RMEL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 3;
    postSynaptic[neurons.indexOf('URADL')][nextState] += 3;
}

function IL2DR() {
    postSynaptic[neurons.indexOf('CEPDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1DR')][nextState] += 7;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 11;
    postSynaptic[neurons.indexOf('RMED')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 1;
    postSynaptic[neurons.indexOf('URADR')][nextState] += 3;
}

function IL2L() {
    postSynaptic[neurons.indexOf('ADEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1L')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQDL')][nextState] += 5;
    postSynaptic[neurons.indexOf('OLQVL')][nextState] += 8;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 7;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('URXL')][nextState] += 2;
}

function IL2R() {
    postSynaptic[neurons.indexOf('ADER')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1R')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1VR')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLLR')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('OLQVR')][nextState] += 7;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 6;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URXR')][nextState] += 1;
}

function IL2VL() {
    postSynaptic[neurons.indexOf('BAGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1VL')][nextState] += 7;
    postSynaptic[neurons.indexOf('IL2L')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 1;
    postSynaptic[neurons.indexOf('URAVL')][nextState] += 3;
}

function IL2VR() {
    postSynaptic[neurons.indexOf('IL1VR')][nextState] += 6;
    postSynaptic[neurons.indexOf('OLQVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 15;
    postSynaptic[neurons.indexOf('RMEL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 3;
    postSynaptic[neurons.indexOf('URAVR')][nextState] += 4;
    postSynaptic[neurons.indexOf('URXR')][nextState] += 1;
}

function LUAL() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PLML')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVWL')][nextState] += 1;
}

function LUAR() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PLMR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVWL')][nextState] += 1;
}

function M1() {
    postSynaptic[neurons.indexOf('I2L')][nextState] += 2;
    postSynaptic[neurons.indexOf('I2R')][nextState] += 2;
    postSynaptic[neurons.indexOf('I3')][nextState] += 1;
    postSynaptic[neurons.indexOf('I4')][nextState] += 1;
}

function M2L() {
    postSynaptic[neurons.indexOf('I1L')][nextState] += 3;
    postSynaptic[neurons.indexOf('I1R')][nextState] += 3;
    postSynaptic[neurons.indexOf('I3')][nextState] += 3;
    postSynaptic[neurons.indexOf('M2R')][nextState] += 1;
    postSynaptic[neurons.indexOf('M5')][nextState] += 1;
    postSynaptic[neurons.indexOf('MI')][nextState] += 4;
}

function M2R() {
    postSynaptic[neurons.indexOf('I1L')][nextState] += 3;
    postSynaptic[neurons.indexOf('I1R')][nextState] += 3;
    postSynaptic[neurons.indexOf('I3')][nextState] += 3;
    postSynaptic[neurons.indexOf('M3L')][nextState] += 1;
    postSynaptic[neurons.indexOf('M3R')][nextState] += 1;
    postSynaptic[neurons.indexOf('M5')][nextState] += 1;
    postSynaptic[neurons.indexOf('MI')][nextState] += 4;
}

function M3L() {
    postSynaptic[neurons.indexOf('I1L')][nextState] += 4;
    postSynaptic[neurons.indexOf('I1R')][nextState] += 4;
    postSynaptic[neurons.indexOf('I4')][nextState] += 2;
    postSynaptic[neurons.indexOf('I5')][nextState] += 3;
    postSynaptic[neurons.indexOf('I6')][nextState] += 1;
    postSynaptic[neurons.indexOf('M1')][nextState] += 2;
    postSynaptic[neurons.indexOf('M3R')][nextState] += 1;
    postSynaptic[neurons.indexOf('MCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('MCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MI')][nextState] += 2;
    postSynaptic[neurons.indexOf('NSML')][nextState] += 2;
    postSynaptic[neurons.indexOf('NSMR')][nextState] += 3;
}

function M3R() {
    postSynaptic[neurons.indexOf('I1L')][nextState] += 4;
    postSynaptic[neurons.indexOf('I1R')][nextState] += 4;
    postSynaptic[neurons.indexOf('I3')][nextState] += 2;
    postSynaptic[neurons.indexOf('I4')][nextState] += 6;
    postSynaptic[neurons.indexOf('I5')][nextState] += 3;
    postSynaptic[neurons.indexOf('I6')][nextState] += 1;
    postSynaptic[neurons.indexOf('M1')][nextState] += 2;
    postSynaptic[neurons.indexOf('M3L')][nextState] += 1;
    postSynaptic[neurons.indexOf('MCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('MCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MI')][nextState] += 2;
    postSynaptic[neurons.indexOf('NSML')][nextState] += 2;
    postSynaptic[neurons.indexOf('NSMR')][nextState] += 3;
}

function M4() {
    postSynaptic[neurons.indexOf('I3')][nextState] += 1;
    postSynaptic[neurons.indexOf('I5')][nextState] += 13;
    postSynaptic[neurons.indexOf('I6')][nextState] += 3;
    postSynaptic[neurons.indexOf('M2L')][nextState] += 1;
    postSynaptic[neurons.indexOf('M2R')][nextState] += 1;
    postSynaptic[neurons.indexOf('M4')][nextState] += 6;
    postSynaptic[neurons.indexOf('M5')][nextState] += 1;
    postSynaptic[neurons.indexOf('NSML')][nextState] += 1;
    postSynaptic[neurons.indexOf('NSMR')][nextState] += 1;
}

function M5() {
    postSynaptic[neurons.indexOf('I5')][nextState] += 3;
    postSynaptic[neurons.indexOf('I5')][nextState] += 1;
    postSynaptic[neurons.indexOf('I6')][nextState] += 1;
    postSynaptic[neurons.indexOf('M1')][nextState] += 2;
    postSynaptic[neurons.indexOf('M2L')][nextState] += 2;
    postSynaptic[neurons.indexOf('M2R')][nextState] += 2;
    postSynaptic[neurons.indexOf('M5')][nextState] += 4;
}

function MCL() {
    postSynaptic[neurons.indexOf('I1L')][nextState] += 3;
    postSynaptic[neurons.indexOf('I1R')][nextState] += 3;
    postSynaptic[neurons.indexOf('I2L')][nextState] += 1;
    postSynaptic[neurons.indexOf('I2R')][nextState] += 1;
    postSynaptic[neurons.indexOf('I3')][nextState] += 1;
    postSynaptic[neurons.indexOf('M1')][nextState] += 2;
    postSynaptic[neurons.indexOf('M2L')][nextState] += 2;
    postSynaptic[neurons.indexOf('M2R')][nextState] += 2;
}

function MCR() {
    postSynaptic[neurons.indexOf('I1L')][nextState] += 3;
    postSynaptic[neurons.indexOf('I1R')][nextState] += 3;
    postSynaptic[neurons.indexOf('I3')][nextState] += 1;
    postSynaptic[neurons.indexOf('M1')][nextState] += 2;
    postSynaptic[neurons.indexOf('M2L')][nextState] += 2;
    postSynaptic[neurons.indexOf('M2R')][nextState] += 2;
}

function MI() {
    postSynaptic[neurons.indexOf('I1L')][nextState] += 1;
    postSynaptic[neurons.indexOf('I1R')][nextState] += 1;
    postSynaptic[neurons.indexOf('I3')][nextState] += 1;
    postSynaptic[neurons.indexOf('I4')][nextState] += 1;
    postSynaptic[neurons.indexOf('I5')][nextState] += 2;
    postSynaptic[neurons.indexOf('M1')][nextState] += 1;
    postSynaptic[neurons.indexOf('M2L')][nextState] += 2;
    postSynaptic[neurons.indexOf('M2R')][nextState] += 2;
    postSynaptic[neurons.indexOf('M3L')][nextState] += 1;
    postSynaptic[neurons.indexOf('M3R')][nextState] += 1;
    postSynaptic[neurons.indexOf('MCL')][nextState] += 2;
    postSynaptic[neurons.indexOf('MCR')][nextState] += 2;
}

function NSML() {
    postSynaptic[neurons.indexOf('I1L')][nextState] += 1;
    postSynaptic[neurons.indexOf('I1R')][nextState] += 2;
    postSynaptic[neurons.indexOf('I2L')][nextState] += 6;
    postSynaptic[neurons.indexOf('I2R')][nextState] += 6;
    postSynaptic[neurons.indexOf('I3')][nextState] += 2;
    postSynaptic[neurons.indexOf('I4')][nextState] += 3;
    postSynaptic[neurons.indexOf('I5')][nextState] += 2;
    postSynaptic[neurons.indexOf('I6')][nextState] += 2;
    postSynaptic[neurons.indexOf('M3L')][nextState] += 2;
    postSynaptic[neurons.indexOf('M3R')][nextState] += 2;
}

function NSMR() {
    postSynaptic[neurons.indexOf('I1L')][nextState] += 2;
    postSynaptic[neurons.indexOf('I1R')][nextState] += 2;
    postSynaptic[neurons.indexOf('I2L')][nextState] += 6;
    postSynaptic[neurons.indexOf('I2R')][nextState] += 6;
    postSynaptic[neurons.indexOf('I3')][nextState] += 2;
    postSynaptic[neurons.indexOf('I4')][nextState] += 3;
    postSynaptic[neurons.indexOf('I5')][nextState] += 2;
    postSynaptic[neurons.indexOf('I6')][nextState] += 2;
    postSynaptic[neurons.indexOf('M3L')][nextState] += 2;
    postSynaptic[neurons.indexOf('M3R')][nextState] += 2;
}

function OLLL() {
    postSynaptic[neurons.indexOf('AVER')][nextState] += 21;
    postSynaptic[neurons.indexOf('CEPDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('CEPVL')][nextState] += 4;
    postSynaptic[neurons.indexOf('IL1DL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1VL')][nextState] += 2;
    postSynaptic[neurons.indexOf('OLLR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 8;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 7;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 4;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 4;
    postSynaptic[neurons.indexOf('URYDL')][nextState] += 1;
}

function OLLR() {
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 16;
    postSynaptic[neurons.indexOf('CEPDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('CEPVR')][nextState] += 6;
    postSynaptic[neurons.indexOf('IL1DR')][nextState] += 3;
    postSynaptic[neurons.indexOf('IL1VR')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL2R')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLLL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 10;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 10;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 4;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 3;
}

function OLQDL() {
    postSynaptic[neurons.indexOf('CEPDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBVL')][nextState] += 3;
    postSynaptic[neurons.indexOf('URBL')][nextState] += 1;
}

function OLQDR() {
    postSynaptic[neurons.indexOf('CEPDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('URBR')][nextState] += 1;
}

function OLQVL() {
    postSynaptic[neurons.indexOf('ADLL')][nextState] += 1;
    postSynaptic[neurons.indexOf('CEPVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1VL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL2VL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 4;
    postSynaptic[neurons.indexOf('SIBDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('URBL')][nextState] += 1;
}

function OLQVR() {
    postSynaptic[neurons.indexOf('CEPVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1VR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBDR')][nextState] += 4;
    postSynaptic[neurons.indexOf('URBR')][nextState] += 1;
}

function PDA() {
    postSynaptic[neurons.indexOf('AS11')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD6')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL21')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD13')][nextState] += 3;
}

function PDB() {
    postSynaptic[neurons.indexOf('AS11')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL22')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR21')][nextState] += 1;
    postSynaptic[neurons.indexOf('RID')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD13')][nextState] += 2;
}

function PDEL() {
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 6;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 24;
    postSynaptic[neurons.indexOf('PDER')][nextState] += 1;
    postSynaptic[neurons.indexOf('PDER')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVM')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVM')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD11')][nextState] += 1;
}

function PDER() {
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 16;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 35;
    postSynaptic[neurons.indexOf('PDEL')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVM')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA8')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD9')][nextState] += 1;
}

function PHAL() {
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVG')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 2;
    postSynaptic[neurons.indexOf('PHAR')][nextState] += 5;
    postSynaptic[neurons.indexOf('PHAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('PHBL')][nextState] += 5;
    postSynaptic[neurons.indexOf('PHBR')][nextState] += 5;
    postSynaptic[neurons.indexOf('PVQL')][nextState] += 2;
}

function PHAR() {
    postSynaptic[neurons.indexOf('AVG')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA8')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHAL')][nextState] += 6;
    postSynaptic[neurons.indexOf('PHAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PHBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHBR')][nextState] += 5;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVQL')][nextState] += 2;
}

function PHBL() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 9;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHBR')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 13;
    postSynaptic[neurons.indexOf('VA12')][nextState] += 1;
}

function PHBR() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA8')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHBL')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 6;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA12')][nextState] += 2;
}

function PHCL() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA9')][nextState] += 7;
    postSynaptic[neurons.indexOf('DA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 6;
    postSynaptic[neurons.indexOf('LUAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PLML')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA12')][nextState] += 3;
}

function PHCR() {
    postSynaptic[neurons.indexOf('AVHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA9')][nextState] += 2;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 8;
    postSynaptic[neurons.indexOf('LUAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHCL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 9;
    postSynaptic[neurons.indexOf('VA12')][nextState] += 2;
}

function PLML() {
    postSynaptic[neurons.indexOf('HSNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('LUAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 1;
}

function PLMR() {
    postSynaptic[neurons.indexOf('AS6')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 4;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 5;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('LUAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PDEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PDER')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVR')][nextState] += 2;
}

function PLNL() {
    postSynaptic[neurons.indexOf('SAADL')][nextState] += 5;
    postSynaptic[neurons.indexOf('SMBVL')][nextState] += 6;
}

function PLNR() {
    postSynaptic[neurons.indexOf('SAADR')][nextState] += 4;
    postSynaptic[neurons.indexOf('SMBVR')][nextState] += 6;
}

function PQR() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 8;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 11;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVG')][nextState] += 1;
    postSynaptic[neurons.indexOf('LUAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 4;
}

function PVCL() {
    postSynaptic[neurons.indexOf('AS1')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 12;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA2')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA5')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA6')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB2')][nextState] += 3;
    postSynaptic[neurons.indexOf('DB3')][nextState] += 4;
    postSynaptic[neurons.indexOf('DB4')][nextState] += 3;
    postSynaptic[neurons.indexOf('DB5')][nextState] += 2;
    postSynaptic[neurons.indexOf('DB6')][nextState] += 2;
    postSynaptic[neurons.indexOf('DB7')][nextState] += 3;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 5;
    postSynaptic[neurons.indexOf('PLML')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 7;
    postSynaptic[neurons.indexOf('RID')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 2;
    postSynaptic[neurons.indexOf('SIBVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB10')][nextState] += 3;
    postSynaptic[neurons.indexOf('VB11')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB5')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB6')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB8')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB9')][nextState] += 2;
}

function PVCR() {
    postSynaptic[neurons.indexOf('AQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS2')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 12;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 10;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 8;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB2')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB3')][nextState] += 3;
    postSynaptic[neurons.indexOf('DB4')][nextState] += 4;
    postSynaptic[neurons.indexOf('DB5')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB6')][nextState] += 2;
    postSynaptic[neurons.indexOf('DB7')][nextState] += 1;
    postSynaptic[neurons.indexOf('FLPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('LUAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PDEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PHCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PLMR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 8;
    postSynaptic[neurons.indexOf('PVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVWL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVWR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RID')][nextState] += 5;
    postSynaptic[neurons.indexOf('SIBVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA8')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB10')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB4')][nextState] += 3;
    postSynaptic[neurons.indexOf('VB6')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB7')][nextState] += 3;
    postSynaptic[neurons.indexOf('VB8')][nextState] += 1;
}

function PVDL() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 6;
    postSynaptic[neurons.indexOf('DD5')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 6;
    postSynaptic[neurons.indexOf('VD10')][nextState] += 6;
}

function PVDR() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 9;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 13;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 10;
    postSynaptic[neurons.indexOf('PVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA9')][nextState] += 1;
}

function PVM() {
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 11;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVM')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 3;
    postSynaptic[neurons.indexOf('PDEL')][nextState] += 7;
    postSynaptic[neurons.indexOf('PDEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PDER')][nextState] += 8;
    postSynaptic[neurons.indexOf('PDER')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVR')][nextState] += 1;
}

function PVNL() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVG')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('BDUL')][nextState] += 1;
    postSynaptic[neurons.indexOf('BDUR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL09')][nextState] += 3;
    postSynaptic[neurons.indexOf('PQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVNR')][nextState] += 5;
    postSynaptic[neurons.indexOf('PVQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVWL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIFL')][nextState] += 1;
}

function PVNR() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('BDUL')][nextState] += 1;
    postSynaptic[neurons.indexOf('BDUR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD3')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL12')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL13')][nextState] += 2;
    postSynaptic[neurons.indexOf('PQR')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVWL')][nextState] += 2;
    postSynaptic[neurons.indexOf('VC2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VC3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD12')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD6')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD7')][nextState] += 1;
}

function PVPL() {
    postSynaptic[neurons.indexOf('ADAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AQR')][nextState] += 8;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 6;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 2;
    postSynaptic[neurons.indexOf('PHAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('PQR')][nextState] += 4;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 3;
    postSynaptic[neurons.indexOf('PVPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD13')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 1;
}

function PVPR() {
    postSynaptic[neurons.indexOf('ADFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AQR')][nextState] += 11;
    postSynaptic[neurons.indexOf('ASHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVHL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 4;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 14;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 4;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 7;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 1;
}

function PVQL() {
    postSynaptic[neurons.indexOf('ADAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('ASJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASKL')][nextState] += 4;
    postSynaptic[neurons.indexOf('ASKL')][nextState] += 5;
    postSynaptic[neurons.indexOf('HSNL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVQR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 1;
}

function PVQR() {
    postSynaptic[neurons.indexOf('ADAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIAR')][nextState] += 7;
    postSynaptic[neurons.indexOf('ASER')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASKR')][nextState] += 8;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVQL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 1;
}

function PVR() {
    postSynaptic[neurons.indexOf('ADAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ALML')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS6')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB2')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB3')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 3;
    postSynaptic[neurons.indexOf('IL1DL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1DR')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1VL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1VR')][nextState] += 1;
    postSynaptic[neurons.indexOf('LUAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('LUAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PDEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PDER')][nextState] += 1;
    postSynaptic[neurons.indexOf('PLMR')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 3;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 1;
    postSynaptic[neurons.indexOf('URADL')][nextState] += 1;
}

function PVT() {
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 9;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMFL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMFR')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 1;
}

function PVWL() {
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVWR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA12')][nextState] += 1;
}


function PVWR() {
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA12')][nextState] += 1;
}

function RIAL() {
    postSynaptic[neurons.indexOf('CEPVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIVR')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 12;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 7;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 6;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 6;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 9;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 11;
    postSynaptic[neurons.indexOf('SIADL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 8;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 10;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 6;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 11;
}

function RIAR() {
    postSynaptic[neurons.indexOf('CEPVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1R')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 10;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 11;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 8;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 12;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 10;
    postSynaptic[neurons.indexOf('SAADR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIADL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIADR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIAVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 7;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 7;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 13;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 7;
}

function RIBL() {
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AUAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 5;
    postSynaptic[neurons.indexOf('BAGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('OLQVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIADL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIAVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 4;
}

function RIBR() {
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('BAGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('OLQVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIADR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIAVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 2;
}

function RICL() {
    postSynaptic[neurons.indexOf('ADAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AWBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 1;
}

function RICR() {
    postSynaptic[neurons.indexOf('ADAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 4;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 1;
}

function RID() {
    postSynaptic[neurons.indexOf('ALA')][nextState] += 1;
    postSynaptic[neurons.indexOf('AS2')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA6')][nextState] += 3;
    postSynaptic[neurons.indexOf('DA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 4;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 4;
    postSynaptic[neurons.indexOf('DD3')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDL14')][nextState] += -2;
    postSynaptic[neurons.indexOf('MDL21')][nextState] += -3;
    postSynaptic[neurons.indexOf('PDB')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD13')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 1;
}

function RIFL() {
    postSynaptic[neurons.indexOf('ALML')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 10;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVG')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 4;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 1;
}

function RIFR() {
    postSynaptic[neurons.indexOf('ASHR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 17;
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVG')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 2;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPR')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 1;
}

function RIGL() {
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ALNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AQR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 2;
    postSynaptic[neurons.indexOf('BAGR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLLL')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMHR')][nextState] += 3;
    postSynaptic[neurons.indexOf('URYDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('URYVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 2;
}

function RIGR() {
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 3;
    postSynaptic[neurons.indexOf('ALNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 2;
    postSynaptic[neurons.indexOf('BAGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLLR')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMHL')][nextState] += 4;
    postSynaptic[neurons.indexOf('URYDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URYVR')][nextState] += 1;
}

function RIH() {
    postSynaptic[neurons.indexOf('ADFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AUAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('BAGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('CEPDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('CEPDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('CEPVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('CEPVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('FLPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL2L')][nextState] += 2;
    postSynaptic[neurons.indexOf('IL2R')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQDL')][nextState] += 4;
    postSynaptic[neurons.indexOf('OLQDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('OLQVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQVR')][nextState] += 6;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 10;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 8;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 6;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 1;
    postSynaptic[neurons.indexOf('URYVR')][nextState] += 1;
}

function RIML() {
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIYL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR05')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVR05')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAADR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAAVL')][nextState] += 3;
    postSynaptic[neurons.indexOf('SAAVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 5;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 1;
}

function RIMR() {
    postSynaptic[neurons.indexOf('ADAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIYR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL05')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL07')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL05')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL07')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAAVL')][nextState] += 3;
    postSynaptic[neurons.indexOf('SAAVR')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 4;
}

function RIPL() {
    postSynaptic[neurons.indexOf('OLQDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMED')][nextState] += 1;
}

function RIPR() {
    postSynaptic[neurons.indexOf('OLQDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMED')][nextState] += 1;
}

function RIR() {
    postSynaptic[neurons.indexOf('AFDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIZL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AIZR')][nextState] += 5;
    postSynaptic[neurons.indexOf('AUAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('BAGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('BAGR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 2;
    postSynaptic[neurons.indexOf('HSNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('URXL')][nextState] += 5;
    postSynaptic[neurons.indexOf('URXR')][nextState] += 1;
}

function RIS() {
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('CEPDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('CEPVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('CEPVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB1')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLLR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 5;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 4;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URYVR')][nextState] += 1;
}

function RIVL() {
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR05')][nextState] += -2;
    postSynaptic[neurons.indexOf('MVR06')][nextState] += -2;
    postSynaptic[neurons.indexOf('MVR08')][nextState] += -3;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SAADR')][nextState] += 3;
    postSynaptic[neurons.indexOf('SDQR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SIAVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 1;
}

function RIVR() {
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL05')][nextState] += -2;
    postSynaptic[neurons.indexOf('MVL06')][nextState] += -2;
    postSynaptic[neurons.indexOf('MVL08')][nextState] += -2;
    postSynaptic[neurons.indexOf('MVR04')][nextState] += -2;
    postSynaptic[neurons.indexOf('MVR06')][nextState] += -2;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAADL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SDQR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SIAVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 4;
}

function RMDDL() {
    postSynaptic[neurons.indexOf('MDR01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR02')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR08')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVR01')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 7;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 1;
}

function RMDDR() {
    postSynaptic[neurons.indexOf('MDL01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL02')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL03')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR02')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 12;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAADR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URYDL')][nextState] += 1;
}

function RMDL() {
    postSynaptic[neurons.indexOf('MDL03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL05')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR05')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVR07')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLLR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMFL')][nextState] += 1;
}

function RMDR() {
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL05')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR05')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL05')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 7;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 1;
}

function RMDVL() {
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR02')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR05')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR06')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR08')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 6;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAAVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 1;
}

function RMDVR() {
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL02')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL05')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL06')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL08')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR06')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR08')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAAVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 1;
}

function RMED() {
    postSynaptic[neurons.indexOf('IL1VL')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL02')][nextState] += -4;
    postSynaptic[neurons.indexOf('MVL04')][nextState] += -4;
    postSynaptic[neurons.indexOf('MVL06')][nextState] += -4;
    postSynaptic[neurons.indexOf('MVR02')][nextState] += -4;
    postSynaptic[neurons.indexOf('MVR04')][nextState] += -4;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 2;
}

function RMEL() {
    postSynaptic[neurons.indexOf('MDR01')][nextState] += -5;
    postSynaptic[neurons.indexOf('MDR03')][nextState] += -5;
    postSynaptic[neurons.indexOf('MVR01')][nextState] += -5;
    postSynaptic[neurons.indexOf('MVR03')][nextState] += -5;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 1;
}

function RMER() {
    postSynaptic[neurons.indexOf('MDL01')][nextState] += -7;
    postSynaptic[neurons.indexOf('MDL03')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVL01')][nextState] += -7;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 1;
}

function RMEV() {
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1DL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1DR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL02')][nextState] += -3;
    postSynaptic[neurons.indexOf('MDL04')][nextState] += -3;
    postSynaptic[neurons.indexOf('MDL06')][nextState] += -3;
    postSynaptic[neurons.indexOf('MDR02')][nextState] += -3;
    postSynaptic[neurons.indexOf('MDR04')][nextState] += -3;
    postSynaptic[neurons.indexOf('RMED')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 1;
}

function RMFL() {
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 4;
    postSynaptic[neurons.indexOf('MDR03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR03')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URBR')][nextState] += 1;
}

function RMFR() {
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 2;
}

function RMGL() {
    postSynaptic[neurons.indexOf('ADAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ADLL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ALML')][nextState] += 1;
    postSynaptic[neurons.indexOf('ALNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHL')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASKL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AWBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('CEPDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL2L')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL05')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL05')][nextState] += 2;
    postSynaptic[neurons.indexOf('RID')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMHL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIAVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBVL')][nextState] += 3;
    postSynaptic[neurons.indexOf('SIBVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('URXL')][nextState] += 2;
}

function RMGR() {
    postSynaptic[neurons.indexOf('ADAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIMR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ALNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('ASHR')][nextState] += 2;
    postSynaptic[neurons.indexOf('ASKR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVJL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AWBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL2R')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR05')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR05')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR07')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 5;
    postSynaptic[neurons.indexOf('RMHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URXR')][nextState] += 2;
}

function RMHL() {
    postSynaptic[neurons.indexOf('MDR01')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR03')][nextState] += 3;
    postSynaptic[neurons.indexOf('MVR01')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 3;
    postSynaptic[neurons.indexOf('SIBVR')][nextState] += 1;
}

function RMHR() {
    postSynaptic[neurons.indexOf('MDL01')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL03')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL05')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL01')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMGR')][nextState] += 1;
}

function SAADL() {
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 6;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 6;
    postSynaptic[neurons.indexOf('RMGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDL')][nextState] += 1;
}

function SAADR() {
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('OLLL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 5;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 1;
}

function SAAVL() {
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('ALNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 16;
    postSynaptic[neurons.indexOf('OLLR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 12;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMFR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMBVR')][nextState] += 3;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 8;
}

function SAAVR() {
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 13;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIMR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 6;
}

function SABD() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 4;
    postSynaptic[neurons.indexOf('VA2')][nextState] += 4;
    postSynaptic[neurons.indexOf('VA3')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA4')][nextState] += 1;
}

function SABVL() {
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('DA1')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA2')][nextState] += 1;
}

function SABVR() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA1')][nextState] += 3;
}

function SDQL() {
    postSynaptic[neurons.indexOf('ALML')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('FLPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SDQR')][nextState] += 1;
}

function SDQR() {
    postSynaptic[neurons.indexOf('ADLL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AIBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 4;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 3;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMHL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SDQL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBVL')][nextState] += 1;
}

function SIADL() {
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
}

function SIADR() {
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
}

function SIAVL() {
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
}

function SIAVR() {
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
}

function SIBDL() {
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBVL')][nextState] += 1;
}

function SIBDR() {
    postSynaptic[neurons.indexOf('AIML')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBVR')][nextState] += 1;
}

function SIBVL() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SDQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBDL')][nextState] += 1;
}

function SIBVR() {
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBDR')][nextState] += 1;
}

function SMBDL() {
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR01')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR02')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR03')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR04')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR06')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMED')][nextState] += 3;
    postSynaptic[neurons.indexOf('SAADL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SAAVR')][nextState] += 1;
}

function SMBDR() {
    postSynaptic[neurons.indexOf('ALNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL02')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL06')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR08')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMED')][nextState] += 4;
    postSynaptic[neurons.indexOf('SAAVL')][nextState] += 3;
}

function SMBVL() {
    postSynaptic[neurons.indexOf('MVL01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL02')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL05')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL06')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL08')][nextState] += 1;
    postSynaptic[neurons.indexOf('PLNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 5;
    postSynaptic[neurons.indexOf('SAADL')][nextState] += 3;
    postSynaptic[neurons.indexOf('SAAVR')][nextState] += 2;
}

function SMBVR() {
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR01')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR02')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR06')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR07')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 3;
    postSynaptic[neurons.indexOf('SAADR')][nextState] += 4;
    postSynaptic[neurons.indexOf('SAAVL')][nextState] += 3;
}

function SMDDL() {
    postSynaptic[neurons.indexOf('MDL04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL06')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL08')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR02')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR05')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR06')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR07')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL02')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL04')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 2;
}

function SMDDR() {
    postSynaptic[neurons.indexOf('MDL04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL05')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL06')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDL08')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR06')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR02')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 1;
}

function SMDVL() {
    postSynaptic[neurons.indexOf('MVL03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL06')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR02')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR06')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 8;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 4;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 1;
}

function SMDVR() {
    postSynaptic[neurons.indexOf('MVL02')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL03')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL04')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR07')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 7;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 5;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB1')][nextState] += 1;
}

function URADL() {
    postSynaptic[neurons.indexOf('IL1DL')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL02')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL03')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDL04')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMEL')][nextState] += 1;
}

function URADR() {
    postSynaptic[neurons.indexOf('IL1DR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MDR01')][nextState] += 3;
    postSynaptic[neurons.indexOf('MDR02')][nextState] += 2;
    postSynaptic[neurons.indexOf('MDR03')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMED')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 1;
    postSynaptic[neurons.indexOf('URYDR')][nextState] += 1;
}

function URAVL() {
    postSynaptic[neurons.indexOf('MVL01')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL02')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL03')][nextState] += 3;
    postSynaptic[neurons.indexOf('MVL04')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIPL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMEL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 2;
}

function URAVR() {
    postSynaptic[neurons.indexOf('IL1R')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR01')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVR02')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVR03')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVR04')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMER')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMEV')][nextState] += 2;
}

function URBL() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('CEPDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1L')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIAVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('URXL')][nextState] += 2;
}

function URBR() {
    postSynaptic[neurons.indexOf('ADAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('CEPDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('IL1R')][nextState] += 3;
    postSynaptic[neurons.indexOf('IL2R')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RICR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIAVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMBDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('URXR')][nextState] += 4;
}

function URXL() {
    postSynaptic[neurons.indexOf('ASHL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AUAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVJR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 8;
    postSynaptic[neurons.indexOf('RICL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMGL')][nextState] += 1;
}

function URXR() {
    postSynaptic[neurons.indexOf('AUAR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 2;
    postSynaptic[neurons.indexOf('IL2R')][nextState] += 1;
    postSynaptic[neurons.indexOf('OLQVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIPR')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMGR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SIAVR')][nextState] += 1;
}

function URYDL() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 6;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 1;
}

function URYDR() {
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 3;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 5;
    postSynaptic[neurons.indexOf('SMDDL')][nextState] += 4;
}

function URYVL() {
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVER')][nextState] += 5;
    postSynaptic[neurons.indexOf('IL1VL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIH')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIS')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDL')][nextState] += 4;
    postSynaptic[neurons.indexOf('RMDVR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SIBVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 4;
}

function URYVR() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVEL')][nextState] += 6;
    postSynaptic[neurons.indexOf('IL1VR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGR')][nextState] += 1;
    postSynaptic[neurons.indexOf('RMDDR')][nextState] += 6;
    postSynaptic[neurons.indexOf('RMDVL')][nextState] += 4;
    postSynaptic[neurons.indexOf('SIBDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('SIBVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVL')][nextState] += 3;
}

function VA1() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 3;
    postSynaptic[neurons.indexOf('DA2')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 9;
    postSynaptic[neurons.indexOf('MVL07')][nextState] += 3;
    postSynaptic[neurons.indexOf('MVL08')][nextState] += 3;
    postSynaptic[neurons.indexOf('MVR07')][nextState] += 3;
    postSynaptic[neurons.indexOf('MVR08')][nextState] += 3;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 2;
}

function VA2() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 13;
    postSynaptic[neurons.indexOf('MVL07')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL10')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR07')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR10')][nextState] += 5;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA3')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB1')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 11;
}

function VA3() {
    postSynaptic[neurons.indexOf('AS1')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 18;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 11;
    postSynaptic[neurons.indexOf('MVL09')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL10')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL12')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR09')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR10')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR12')][nextState] += 5;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 3;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 3;
}

function VA4() {
    postSynaptic[neurons.indexOf('AS2')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVDL')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA5')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 21;
    postSynaptic[neurons.indexOf('MVL11')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVL12')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVR11')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVR12')][nextState] += 6;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB3')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 3;
}

function VA5() {
    postSynaptic[neurons.indexOf('AS3')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 3;
    postSynaptic[neurons.indexOf('DA5')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 5;
    postSynaptic[neurons.indexOf('DD3')][nextState] += 13;
    postSynaptic[neurons.indexOf('MVL11')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL14')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR11')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR14')][nextState] += 5;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 2;
}

function VA6() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 6;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD3')][nextState] += 24;
    postSynaptic[neurons.indexOf('MVL13')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL14')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR13')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR14')][nextState] += 5;
    postSynaptic[neurons.indexOf('VB5')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD6')][nextState] += 2;
}

function VA7() {
    postSynaptic[neurons.indexOf('AS5')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 4;
    postSynaptic[neurons.indexOf('DD3')][nextState] += 3;
    postSynaptic[neurons.indexOf('DD4')][nextState] += 12;
    postSynaptic[neurons.indexOf('MVL13')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVL15')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVL16')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVR13')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVR15')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVR16')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVULVA')][nextState] += 4;
    postSynaptic[neurons.indexOf('VB3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD7')][nextState] += 9;
}

function VA8() {
    postSynaptic[neurons.indexOf('AS6')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 10;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD4')][nextState] += 21;
    postSynaptic[neurons.indexOf('MVL15')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVL16')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVR15')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVR16')][nextState] += 6;
    postSynaptic[neurons.indexOf('PDER')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA8')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB6')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB8')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB8')][nextState] += 3;
    postSynaptic[neurons.indexOf('VB9')][nextState] += 3;
    postSynaptic[neurons.indexOf('VD7')][nextState] += 5;
    postSynaptic[neurons.indexOf('VD8')][nextState] += 5;
    postSynaptic[neurons.indexOf('VD8')][nextState] += 1;
}

function VA9() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD4')][nextState] += 3;
    postSynaptic[neurons.indexOf('DD5')][nextState] += 15;
    postSynaptic[neurons.indexOf('DVB')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL15')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL18')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR15')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR18')][nextState] += 5;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB8')][nextState] += 6;
    postSynaptic[neurons.indexOf('VB8')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB9')][nextState] += 4;
    postSynaptic[neurons.indexOf('VD7')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD9')][nextState] += 10;
}


function VA10() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL17')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL18')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR17')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR18')][nextState] += 5;
}

function VA11() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 7;
    postSynaptic[neurons.indexOf('DD6')][nextState] += 10;
    postSynaptic[neurons.indexOf('MVL19')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL20')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR19')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR20')][nextState] += 5;
    postSynaptic[neurons.indexOf('PVNR')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB10')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD12')][nextState] += 4;
}

function VA12() {
    postSynaptic[neurons.indexOf('AS11')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DA8')][nextState] += 3;
    postSynaptic[neurons.indexOf('DA9')][nextState] += 5;
    postSynaptic[neurons.indexOf('DB7')][nextState] += 4;
    postSynaptic[neurons.indexOf('DD6')][nextState] += 2;
    postSynaptic[neurons.indexOf('LUAL')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL21')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL22')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL23')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR21')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR22')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR23')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR24')][nextState] += 5;
    postSynaptic[neurons.indexOf('PHCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PHCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 2;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA11')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB11')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD12')][nextState] += 3;
    postSynaptic[neurons.indexOf('VD13')][nextState] += 11;
}

function VB1() {
    postSynaptic[neurons.indexOf('AIBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 4;
    postSynaptic[neurons.indexOf('DB2')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVA')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL07')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL08')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR07')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVR08')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIML')][nextState] += 2;
    postSynaptic[neurons.indexOf('RMFL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SAADL')][nextState] += 9;
    postSynaptic[neurons.indexOf('SAADR')][nextState] += 2;
    postSynaptic[neurons.indexOf('SABD')][nextState] += 1;
    postSynaptic[neurons.indexOf('SMDVR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA1')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB2')][nextState] += 4;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 3;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 1;
}

function VB2() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 3;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 20;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL07')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVL09')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVL10')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVL12')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVR07')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVR09')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVR10')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVR12')][nextState] += 4;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB1')][nextState] += 4;
    postSynaptic[neurons.indexOf('VB3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB5')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB7')][nextState] += 2;
    postSynaptic[neurons.indexOf('VC2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 9;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 3;
}

function VB3() {
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 37;
    postSynaptic[neurons.indexOf('MVL11')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVL12')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVL14')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVR11')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVR12')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVR14')][nextState] += 6;
    postSynaptic[neurons.indexOf('VA4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA7')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB2')][nextState] += 1;
}

function VB4() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 6;
    postSynaptic[neurons.indexOf('DD3')][nextState] += 16;
    postSynaptic[neurons.indexOf('MVL11')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL14')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR11')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR14')][nextState] += 5;
    postSynaptic[neurons.indexOf('VB5')][nextState] += 1;
}

function VB5() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD3')][nextState] += 27;
    postSynaptic[neurons.indexOf('MVL13')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVL14')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVR13')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVR14')][nextState] += 6;
    postSynaptic[neurons.indexOf('VB2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB6')][nextState] += 8;
}

function VB6() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DA4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD4')][nextState] += 30;
    postSynaptic[neurons.indexOf('MVL15')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVL16')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVR15')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVR16')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVULVA')][nextState] += 6;
    postSynaptic[neurons.indexOf('VA8')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB5')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB7')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD6')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD7')][nextState] += 8;
}

function VB7() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD4')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL15')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR15')][nextState] += 5;
    postSynaptic[neurons.indexOf('VB2')][nextState] += 2;
}

function VB8() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 7;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 3;
    postSynaptic[neurons.indexOf('DD5')][nextState] += 30;
    postSynaptic[neurons.indexOf('MVL17')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL18')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL20')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR17')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR18')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR20')][nextState] += 5;
    postSynaptic[neurons.indexOf('VA8')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA9')][nextState] += 9;
    postSynaptic[neurons.indexOf('VA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB9')][nextState] += 6;
    postSynaptic[neurons.indexOf('VD10')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD9')][nextState] += 10;
}

function VB9() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 5;
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 4;
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 6;
    postSynaptic[neurons.indexOf('DD5')][nextState] += 8;
    postSynaptic[neurons.indexOf('DVB')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL17')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVL20')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVR17')][nextState] += 6;
    postSynaptic[neurons.indexOf('MVR20')][nextState] += 6;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA8')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA9')][nextState] += 4;
    postSynaptic[neurons.indexOf('VB8')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB8')][nextState] += 3;
    postSynaptic[neurons.indexOf('VD10')][nextState] += 5;
}

function VB10() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVKL')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD6')][nextState] += 9;
    postSynaptic[neurons.indexOf('MVL19')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL20')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR19')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR20')][nextState] += 5;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD11')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD12')][nextState] += 2;
}

function VB11() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 2;
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD6')][nextState] += 7;
    postSynaptic[neurons.indexOf('MVL21')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL22')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL23')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR21')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR22')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR23')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVR24')][nextState] += 5;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA12')][nextState] += 2;
}

function VC1() {
    postSynaptic[neurons.indexOf('AVL')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 7;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 6;
    postSynaptic[neurons.indexOf('DD3')][nextState] += 6;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVULVA')][nextState] += 6;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 2;
    postSynaptic[neurons.indexOf('VC2')][nextState] += 9;
    postSynaptic[neurons.indexOf('VC3')][nextState] += 3;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 5;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 5;
    postSynaptic[neurons.indexOf('VD6')][nextState] += 1;
}

function VC2() {
    postSynaptic[neurons.indexOf('DB4')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 6;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 4;
    postSynaptic[neurons.indexOf('DD3')][nextState] += 9;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVULVA')][nextState] += 10;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVQR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 2;
    postSynaptic[neurons.indexOf('VC1')][nextState] += 10;
    postSynaptic[neurons.indexOf('VC3')][nextState] += 6;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 5;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 5;
    postSynaptic[neurons.indexOf('VD6')][nextState] += 1;
}

function VC3() {
    postSynaptic[neurons.indexOf('AVL')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 2;
    postSynaptic[neurons.indexOf('DD2')][nextState] += 4;
    postSynaptic[neurons.indexOf('DD3')][nextState] += 5;
    postSynaptic[neurons.indexOf('DD4')][nextState] += 13;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 1;
    postSynaptic[neurons.indexOf('HSNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVULVA')][nextState] += 11;
    postSynaptic[neurons.indexOf('PVNR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVQR')][nextState] += 4;
    postSynaptic[neurons.indexOf('VC1')][nextState] += 4;
    postSynaptic[neurons.indexOf('VC2')][nextState] += 3;
    postSynaptic[neurons.indexOf('VC4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VC5')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 4;
    postSynaptic[neurons.indexOf('VD6')][nextState] += 4;
    postSynaptic[neurons.indexOf('VD7')][nextState] += 5;
}

function VC4() {
    postSynaptic[neurons.indexOf('AVBL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVHR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVULVA')][nextState] += 7;
    postSynaptic[neurons.indexOf('VC1')][nextState] += 1;
    postSynaptic[neurons.indexOf('VC3')][nextState] += 5;
    postSynaptic[neurons.indexOf('VC5')][nextState] += 2;
}

function VC5() {
    postSynaptic[neurons.indexOf('AVFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('AVFR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 2;
    postSynaptic[neurons.indexOf('HSNL')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVULVA')][nextState] += 2;
    postSynaptic[neurons.indexOf('OLLR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVT')][nextState] += 1;
    postSynaptic[neurons.indexOf('URBL')][nextState] += 3;
    postSynaptic[neurons.indexOf('VC3')][nextState] += 3;
    postSynaptic[neurons.indexOf('VC4')][nextState] += 2;
}

function VC6() {
    postSynaptic[neurons.indexOf('MVULVA')][nextState] += 1;
}

function VD1() {
    postSynaptic[neurons.indexOf('DD1')][nextState] += 5;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 5;
    postSynaptic[neurons.indexOf('MVL05')][nextState] += -5;
    postSynaptic[neurons.indexOf('MVL08')][nextState] += -5;
    postSynaptic[neurons.indexOf('MVR05')][nextState] += -5;
    postSynaptic[neurons.indexOf('MVR08')][nextState] += -5;
    postSynaptic[neurons.indexOf('RIFL')][nextState] += 1;
    postSynaptic[neurons.indexOf('RIGL')][nextState] += 2;
    postSynaptic[neurons.indexOf('SMDDR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA1')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA2')][nextState] += 1;
    postSynaptic[neurons.indexOf('VC1')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 7;
}

function VD2() {
    postSynaptic[neurons.indexOf('AS1')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD1')][nextState] += 3;
    postSynaptic[neurons.indexOf('MVL07')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVL10')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVR07')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVR10')][nextState] += -7;
    postSynaptic[neurons.indexOf('VA2')][nextState] += 9;
    postSynaptic[neurons.indexOf('VB2')][nextState] += 3;
    postSynaptic[neurons.indexOf('VD1')][nextState] += 7;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 2;
}

function VD3() {
    postSynaptic[neurons.indexOf('MVL09')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVL12')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVR09')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVR12')][nextState] += -7;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA3')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB2')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD2')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 1;
}

function VD4() {
    postSynaptic[neurons.indexOf('DD2')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL11')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVL12')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVR11')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVR12')][nextState] += -9;
    postSynaptic[neurons.indexOf('PVPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD3')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 1;
}

function VD5() {
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL14')][nextState] += -17;
    postSynaptic[neurons.indexOf('MVR14')][nextState] += -17;
    postSynaptic[neurons.indexOf('PVPR')][nextState] += 1;
    postSynaptic[neurons.indexOf('VA5')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB4')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD4')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD6')][nextState] += 2;
}

function VD6() {
    postSynaptic[neurons.indexOf('AVAL')][nextState] += 1;
    postSynaptic[neurons.indexOf('MVL13')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVL14')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVL16')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVR13')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVR14')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVR16')][nextState] += -7;
    postSynaptic[neurons.indexOf('VA6')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB5')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD5')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD7')][nextState] += 1;
}

function VD7() {
    postSynaptic[neurons.indexOf('MVL15')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVL16')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVR15')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVR16')][nextState] += -7;
    postSynaptic[neurons.indexOf('MVULVA')][nextState] += -15;
    postSynaptic[neurons.indexOf('VA9')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD6')][nextState] += 1;
}

function VD8() {
    postSynaptic[neurons.indexOf('DD4')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL15')][nextState] += -18;
    postSynaptic[neurons.indexOf('MVR15')][nextState] += -18;
    postSynaptic[neurons.indexOf('VA8')][nextState] += 5;
}

function VD9() {
    postSynaptic[neurons.indexOf('MVL17')][nextState] += -10;
    postSynaptic[neurons.indexOf('MVL18')][nextState] += -10;
    postSynaptic[neurons.indexOf('MVR17')][nextState] += -10;
    postSynaptic[neurons.indexOf('MVR18')][nextState] += -10;
    postSynaptic[neurons.indexOf('PDER')][nextState] += 1;
    postSynaptic[neurons.indexOf('VD10')][nextState] += 5;
}

function VD10() {
    postSynaptic[neurons.indexOf('AVBR')][nextState] += 1;
    postSynaptic[neurons.indexOf('DD5')][nextState] += 2;
    postSynaptic[neurons.indexOf('DVC')][nextState] += 4;
    postSynaptic[neurons.indexOf('MVL17')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVL20')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVR17')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVR20')][nextState] += -9;
    postSynaptic[neurons.indexOf('VB9')][nextState] += 2;
    postSynaptic[neurons.indexOf('VD9')][nextState] += 5;
}

function VD11() {
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL19')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVL20')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVR19')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVR20')][nextState] += -9;
    postSynaptic[neurons.indexOf('VA11')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB10')][nextState] += 1;
}

function VD12() {
    postSynaptic[neurons.indexOf('MVL19')][nextState] += -5;
    postSynaptic[neurons.indexOf('MVL21')][nextState] += -5;
    postSynaptic[neurons.indexOf('MVR19')][nextState] += -5;
    postSynaptic[neurons.indexOf('MVR22')][nextState] += -5;
    postSynaptic[neurons.indexOf('VA11')][nextState] += 3;
    postSynaptic[neurons.indexOf('VA12')][nextState] += 2;
    postSynaptic[neurons.indexOf('VB10')][nextState] += 1;
    postSynaptic[neurons.indexOf('VB11')][nextState] += 1;
}

function VD13() {
    postSynaptic[neurons.indexOf('AVAR')][nextState] += 2;
    postSynaptic[neurons.indexOf('MVL21')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVL22')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVL23')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVR21')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVR22')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVR23')][nextState] += -9;
    postSynaptic[neurons.indexOf('MVR24')][nextState] += -9;
    postSynaptic[neurons.indexOf('PVCL')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVCR')][nextState] += 1;
    postSynaptic[neurons.indexOf('PVPL')][nextState] += 2;
    postSynaptic[neurons.indexOf('VA12')][nextState] += 1;
}

// Function to determine how state of connectome has affected muscles + how they translate to final movement:
function motorcontrol() {

  // Accumulator variables:
  accumleft = 0;
  accumright = 0;

  // Loop through list of muscles:
  for (var j=0; j < muscleList.length; j++) {
    // If it's a left muscle:
    if (mLeft.includes(muscleList[j])) {
      // Push the muscle state to the accumulator:
      accumleft += postSynaptic[neurons.indexOf(muscleList[j])][nextState];
      // Reset the muscle:
      postSynaptic[neurons.indexOf(muscleList[j])][nextState] = 0;
    }
    // If it's a right muscle:
    else if (mRight.includes(muscleList[j])) {
      // Push the muscle state to the accumulator:
      accumright += postSynaptic[neurons.indexOf(muscleList[j])][nextState];
      // Reset the muscle:
      postSynaptic[neurons.indexOf(muscleList[j])][nextState] = 0;
    }
  }

  // What's the overall speed?
  new_speed = Math.abs(accumleft) + Math.abs(accumright)
  // Set minimum and maximum speeds to make the worm not idk go insane:
  if (new_speed > 90) { new_speed = 90; }
  else if (new_speed < 75) { new_speed = 75; }
  // Do some console logging for the nerds + debugging:
  console.log("Left: ", accumleft, "Right:", accumright, "Speed: ", new_speed);

}

// Fire a neuron, but don't reset internal state?:
// NOTE: tbh I have no idea why this exists, it's not even used.
function dendriteAccumulate(dneuron) {
  eval(dneuron + "()");
}

// Fire a neuron, but reset the state post-fire:
// NOTE: I have no idea why "MVULVA" is specifically treated as an exception
function fireNeuron(fneuron) {
  if (fneuron != "MVULVA") {
    eval(fneuron + "()");
    postSynaptic[neurons.indexOf(fneuron)][nextState] = 0;
  }
}

// Compute next state of the connectome::
function runconnectome() {

  // Loop through neurons:
  for (var n = 0; n < neurons.length; n++) {
    // If it's not a muscle and we've passed the voltage threshold, fire the neuron!:
    if (!muscles.includes(neurons[n].substring(0, 3)) && Math.abs(postSynaptic[n][nextState]) > threshold) {
      fireNeuron(neurons[n]);
    }
  }

  // Figure out how this new connectome state translates to muscle movements:
  motorcontrol();

  // Previous nextState is now thisState:
  for (var n = 0; n < neurons.length; n++) {
    postSynaptic[n][thisState] = postSynaptic[n][nextState];
  }
  tempState = thisState;
  thisState = nextState;
  nextState = tempState;

}
