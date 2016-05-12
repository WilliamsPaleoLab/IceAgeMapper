import csv
import numpy



class Vars:
    def __init__(self):
        self.tmax1 = None
        self.tmax2 = None
        self.tmax3 = None
        self.tmax4 = None
        self.tmax5 = None        
        self.tmax6 = None
        self.tmax7 = None
        self.tmax8 = None
        self.tmax9 = None
        self.tmax10 = None
        self.tmax11 = None
        self.tmax12 = None
        self.tmin1 = None
        self.tmin2 = None
        self.tmin3 = None
        self.tmin4 = None
        self.tmin5 = None
        self.tmin6 = None
        self.tmin7 = None
        self.tmin8 = None
        self.tmin9 = None
        self.tmin10 = None
        self.tmin11 = None
        self.tmin12 = None
        self.tmean1 = None
        self.tmean2 = None
        self.tmean3 = None
        self.tmean4 = None
        self.tmean5 = None
        self.tmean6 = None
        self.tmean7 = None
        self.tmean8 = None
        self.tmean9 = None
        self.tmean10 = None
        self.tmean11 = None
        self.tmean12 = None
        self.prcp1 = None
        self.prcp2 = None
        self.prcp3 = None
        self.prcp4 = None
        self.prcp5 = None
        self.prcp6 = None
        self.prcp7 = None
        self.prcp8 = None
        self.prcp9 = None
        self.prcp10 = None
        self.prcp11 = None
        self.prcp12 = None
        self.bio1 = None
        self.bio2 = None
        self.bio3 = None
        self.bio4 = None
        self.bio5 = None
        self.bio6 = None
        self.bio7 = None
        self.bio8 = None
        self.bio9 = None
        self.bio10 = None
        self.bio11 = None
        self.bio12 = None
        self.bio13 = None
        self.bio14 = None
        self.bio15 = None
        self.bio16 = None
        self.bio17 = None
        self.bio18 = None
        self.bio19 = None

    def loadFromCSVRow(self, row, start=0):
        '''Loads a new object from an array (from a csv).  The row should be organized as tmin1-12, tmax1-12, prcp1-12.  The loading
        will start at index start'''
        try:
            i = 1
            vars = ['tmin', 'tmax', 'prcp']
            while start < len(row):
                if i < 13:
                    var = vars[0]
                    varname = var + str(i)
                elif i < 25:
                    var = vars[1]
                    varname = var + str(i-12)
                elif i < 38:
                    var = vars[2]
                    varname = var + str(i-24)
                val = float(row[start])
                if val == '--':
                    return False
                setattr(self, varname, val)
                start += 1
                i += 1
            return True
        except Exception as e:
            print "Failed to set properties.  Aborting."
            print "Message was " + str(e)
            return False

    def dump(self):
        import pprint
        pprint.pprint(self.__dict__)

    def calcTmean(self):
        '''Calculates mean monthly temperature for the object'''
        self.tmean1 = numpy.mean(self.tmin1 + self.tmax1)
        self.tmean2 = numpy.mean(self.tmin2 + self.tmax2)
        self.tmean3 = numpy.mean(self.tmin3 + self.tmax3)
        self.tmean4 = numpy.mean(self.tmin4 + self.tmax4)
        self.tmean5 = numpy.mean(self.tmin5 + self.tmax5)
        self.tmean6 = numpy.mean(self.tmin6 + self.tmax6)
        self.tmean7 = numpy.mean(self.tmin7 + self.tmax7)
        self.tmean8 = numpy.mean(self.tmin8 + self.tmax8)
        self.tmean9 = numpy.mean(self.tmin9 + self.tmax9)
        self.tmean10 = numpy.mean(self.tmin10 + self.tmax10)
        self.tmean11 = numpy.mean(self.tmin11 + self.tmax11)
        self.tmean12 = numpy.mean(self.tmin12 + self.tmax12)
        self.tmeanArray = [self.tmean1, self.tmean2, self.tmean3, self.tmean4, self.tmean5, self.tmean6, self.tmean7, self.tmean8,
            self.tmean9, self.tmean10, self.tmean11, self.tmean12]

    def calcBio1(self):
        '''Calculate the first bioclimatic variable: annual mean temperature'''
        self.bio1 = numpy.mean(self.tmeanArray)

    def calcBio2(self):
        '''Calculate the second bioclimatic variable: Annual mean diurnal range'''
        s = 0
        tot = 0
        while s < len(self.tminArray):
            v1 = self.tminArray[s]
            v2 = self.tmaxArray[s]
            dif = v2 - v1
            tot += dif
            s += 1
        tot = tot / 12
        self.bio2 = tot

    def calcBio3(self):
        self.calcBio2()
        self.calcBio7()
        self.bio3 = (self.bio2 / self.bio7) * 100

    def calcBio4(self):
        '''Calculate the fourth bioclimatic variable: Temperature seasonality (standard deviation method from USGS Data Series 691)'''
        self.bio4 = numpy.std(self.tmeanArray)

    def calcBio5(self):
        '''Calculate the fifth bioclimatic variable: maximum temperature of warmest month'''
        self.bio5 = numpy.max(self.tmaxArray)

    def calcBio6(self):
        '''Calculate the sixth bioclimatic variable: minimum temperature of coldest month'''
        self.bio6 = numpy.min(self.tminArray)

    def calcBio7(self):
        '''Calculate the seventh bioclimate variable: Annual temperature range'''
        self.calcBio5()
        self.calcBio6()
        self.bio7 = self.bio5 - self.bio6

    def calcBio8(self):
        '''Calculate the eight bioclimatic variable: Mean temperature of the wettest quarter'''
        i = 0
        prcpQ = []
        inds = []
        while i < len(self.prcpArray):
            a = i
            b = i + 1
            c = i + 2
            if b > 11:
                b = b - 12
            if c > 11:
                c = c - 12
            s = self.prcpArray[a] + self.prcpArray[b] + self.prcpArray[c]
            inds.append([a, b, c])
            prcpQ.append(s)
            i += 1
        m = numpy.max(prcpQ)
        index = prcpQ.index(m)
        months = inds[index]
        self.bio8 = numpy.mean([self.tmeanArray[months[0]], self.tmeanArray[months[1]], self.tmeanArray[months[2]]])

    def calcBio9(self):
        '''Calculate the ninth bioclimatic variable: Mean temperature of driest quarter'''
        i = 0
        prcpQ = []
        inds = []
        while i < len(self.prcpArray):
            a = i
            b = i + 1
            c = i + 2
            if b > 11:
                b = b - 12
            if c > 11:
                c = c - 12
            s = self.prcpArray[a] + self.prcpArray[b] + self.prcpArray[c]
            inds.append([a, b, c])
            prcpQ.append(s)
            i += 1
        m = numpy.min(prcpQ) ## this is the difference from bio 8
        index = prcpQ.index(m)
        months = inds[index]
        self.bio9 = numpy.mean([self.tmeanArray[months[0]], self.tmeanArray[months[1]], self.tmeanArray[months[2]]])

    def calcBio10(self):
        '''Calculate bioclimatic variable 10: mean temperature of warmest quarter'''
        i = 0
        tmeanQ = []
        inds = []
        while i < len(self.tmeanArray):
            a = i
            b = i + 1
            c = i + 2
            if b > 11:
                b = b - 12
            if c > 11:
                c = c - 12
            s = self.tmeanArray[a] + self.tmeanArray[b] + self.tmeanArray[c]
            inds.append([a, b, c])
            tmeanQ.append(s)
            i += 1
        m = numpy.max(tmeanQ)
        index = tmeanQ.index(m)
        months = inds[index]
        self.bio10 = numpy.mean([self.tmeanArray[months[0]], self.tmeanArray[months[1]], self.tmeanArray[months[2]]])

    def calcBio11(self):
        '''Calculate the eleventh bioclimatic variable: Mean temperature of the coldest quarter'''
        i = 0
        tmeanQ = []
        inds = []
        while i < len(self.tmeanArray):
            a = i
            b = i + 1
            c = i + 2
            if b > 11:
                b = b - 12
            if c > 11:
                c = c - 12
            s = self.tmeanArray[a] + self.tmeanArray[b] + self.tmeanArray[c]
            inds.append([a, b, c])
            tmeanQ.append(s)
            i += 1
        m = numpy.min(tmeanQ) ## this is the difference from bio 10
        index = tmeanQ.index(m)
        months = inds[index]
        self.bio11 = numpy.mean([self.tmeanArray[months[0]], self.tmeanArray[months[1]], self.tmeanArray[months[2]]])

    ### now precip vars
    def calcBio12(self):
        '''Calculate bioclimatic variable 12: Total annual precipitation'''
        self.bio12 = sum(self.prcpArray)

    def calcBio13(self):
        '''Calculate bioclimatic variable 13: Precipitation of the wettest month'''
        self.bio13 = numpy.max(self.prcpArray)

    def calcBio14(self):
        '''Calculate bioclimatic variable 14: Precipitation of the driest month'''
        self.bio14 = numpy.min(self.prcpArray)

    def calcBio15(self):
        '''Calculate the bioclimatic variable 15: Precipitation Seasonality'''
        self.calcBio12()
        num = numpy.std(self.prcpArray)
        den = 1 + (self.bio12 / 12)
        self.bio15 = (num / den) * 100

    def calcBio16(self):
        '''Calculate the bioclimatic variable 16: Precipitation of wettest quarter'''
        i = 0
        prcpQ = []
        inds = []
        while i < len(self.prcpArray):
            a = i
            b = i + 1
            c = i + 2
            if b > 11:
                b = b - 12
            if c > 11:
                c = c - 12
            s = self.prcpArray[a] + self.prcpArray[b] + self.prcpArray[c]
            inds.append([a, b, c])
            prcpQ.append(s)
            i += 1
        m = numpy.max(prcpQ)
        self.bio16 = m

    def calcBio17(self):
        '''Calculate the bioclimatic variable 17: Precipitation of driest quarter'''
        i = 0
        prcpQ = []
        inds = []
        while i < len(self.prcpArray):
            a = i
            b = i + 1
            c = i + 2
            if b > 11:
                b = b - 12
            if c > 11:
                c = c - 12
            s = self.prcpArray[a] + self.prcpArray[b] + self.prcpArray[c]
            inds.append([a, b, c])
            prcpQ.append(s)
            i += 1
        m = numpy.min(prcpQ) ## this is the difference from bio 16
        self.bio17 = m

    def calcBio18(self):
        '''Calculate the bioclimatic variable 18: Precipitation of warmest quarter'''
        i = 0
        tmeanQ = []
        inds = []
        while i < len(self.tmeanArray):
            a = i
            b = i + 1
            c = i + 2
            if b > 11:
                b = b - 12
            if c > 11:
                c = c - 12
            s = self.tmeanArray[a] + self.tmeanArray[b] + self.tmeanArray[c]
            inds.append([a, b, c])
            tmeanQ.append(s)
            i += 1
        m = numpy.max(tmeanQ)
        index = tmeanQ.index(m)
        months = inds[index]
        self.bio18 = numpy.mean([self.prcpArray[months[0]], self.prcpArray[months[1]], self.prcpArray[months[2]]])

    def calcBio19(self):
        '''Calculate the bioclimatic variable 19: Precipitation of driest quarter'''
        i = 0
        tmeanQ = []
        inds = []
        while i < len(self.tmeanArray):
            a = i
            b = i + 1
            c = i + 2
            if b > 11:
                b = b - 12
            if c > 11:
                c = c - 12
            s = self.tmeanArray[a] + self.tmeanArray[b] + self.tmeanArray[c]
            inds.append([a, b, c])
            tmeanQ.append(s)
            i += 1
        m = numpy.min(tmeanQ)
        index = tmeanQ.index(m)
        months = inds[index]
        self.bio19 = numpy.mean([self.prcpArray[months[0]], self.prcpArray[months[1]], self.prcpArray[months[2]]])

    def calcAllBioVars(self):
        '''Calculate all 19 biovars in a single go'''
        print "Starting calculations."
        self.calcBio1()
        self.calcBio2()
        self.calcBio3()
        self.calcBio4()
        self.calcBio5()
        self.calcBio6()
        self.calcBio7()
        self.calcBio8()
        self.calcBio9()
        self.calcBio10()
        self.calcBio11()
        self.calcBio12()
        self.calcBio13()
        self.calcBio14()
        self.calcBio15()
        self.calcBio16()
        self.calcBio17()
        self.calcBio18()
        self.calcBio19()

    def setArrays(self):
        self.tmaxArray = [self.tmax1 , self.tmax2 , self.tmax3 , self.tmax4 , self.tmax5 , self.tmax6 , self.tmax7 ,
                          self.tmax8 , self.tmax9 , self.tmax10 , self.tmax11 , self.tmax12]
        self.tminArray = [self.tmin1 , self.tmin2 , self.tmin3 , self.tmin4 , self.tmin5 , self.tmin6 , self.tmin7 ,
                          self.tmin8 , self.tmin9 , self.tmin10 , self.tmin11 , self.tmin12]
        self.prcpArray = [self.prcp1 , self.prcp2 , self.prcp3 , self.prcp4 , self.prcp5 , self.prcp6 , self.prcp7 ,
                          self.prcp8 , self.prcp9 , self.prcp10 , self.prcp11 , self.prcp12]

    def returnBioVars(self):
        return [self.bio1,
                self.bio2,
                self.bio3,
                self.bio4,
                self.bio5,
                self.bio6,
                self.bio7,
                self.bio8,
                self.bio9,
                self.bio10,
                self.bio11,
                self.bio12,
                self.bio13,
                self.bio14,
                self.bio15,
                self.bio16,
                self.bio17,
                self.bio18,
                self.bio19]









import csv
f = open("/users/scottsfarley/documents/Aptana Studio 3 Workspace/thesis/assets/data/sequoia_with_climate.csv", 'r')
out = open("/users/scottsfarley/documents/Aptana Studio 3 Workspace/thesis/assets/data/sequoia_bioclim.csv", 'w')
writer = csv.writer(out, lineterminator="\n")
reader = csv.reader(f)
header = True
for row in reader:
    if header:
        headerrow = row + [
            'bio1',
            'bio2',
            'bio3',
            'bio4',
            'bio5',
            'bio6',
            'bio7',
            'bio8',
            'bio9',
            'bio10',
            'bio11',
            'bio12',
            'bio13',
            'bio14',
            'bio15',
            'bio16',
            'bio17',
            'bio18',
            'bio19']
        writer.writerow(headerrow)
        header = False
    else:
        V = Vars()
        loaded = V.loadFromCSVRow(row, start = 6)
        if loaded:
            V.setArrays()
            V.calcTmean()
            V.calcAllBioVars()
            biovars = V.returnBioVars()
            outrow = row + biovars
            writer.writerow(outrow)

        
        
        
        
