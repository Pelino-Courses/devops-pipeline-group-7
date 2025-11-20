import { useState } from 'react';
import { ArrowLeft, Baby, Heart, Calendar, TrendingUp, Ruler, Weight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import type { User } from '../../App';

interface PregnancyTrackerProps {
  user: User;
}

export function PregnancyTracker({ user }: PregnancyTrackerProps) {
  const calculateWeeksPregnant = () => {
    if (!user.lmp) return 0;
    const lmpDate = new Date(user.lmp);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  };

  const weeksPregnant = calculateWeeksPregnant();
  const trimester = weeksPregnant <= 13 ? 1 : weeksPregnant <= 26 ? 2 : 3;

  const developmentMilestones = {
    1: [
      'Neural tube forming',
      'Heart begins to beat',
      'Facial features developing',
      'Limb buds appearing'
    ],
    2: [
      'All major organs formed',
      'Baby can hear sounds',
      'Develops fingerprints',
      'Practices breathing movements'
    ],
    3: [
      'Brain developing rapidly',
      'Bones hardening',
      'Eyes can open and close',
      'Lungs maturing for birth'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-pink-500 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <ArrowLeft className="w-6 h-6" />
          <h1>Pregnancy Tracker</h1>
        </div>
        
        <Card className="bg-white/95 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-gray-600 text-sm">Current Week</div>
                <div className="text-pink-500">{weeksPregnant} of 40</div>
              </div>
              <div className="text-right">
                <div className="text-gray-600 text-sm">Trimester</div>
                <div className="text-pink-500">{trimester}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-600 text-sm">Days to go</div>
                <div className="text-pink-500">{280 - (weeksPregnant * 7)}</div>
              </div>
            </div>
            <Progress value={(weeksPregnant / 40) * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="p-4 space-y-4">
        <Tabs defaultValue="baby" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="baby">Baby</TabsTrigger>
            <TabsTrigger value="mother">Mother</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="baby" className="space-y-4 mt-4">
            {/* Baby Size */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Baby className="w-5 h-5 text-pink-500" />
                  Baby's Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🍋</div>
                  <p className="text-sm text-gray-600">About the size of a lemon</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <Ruler className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-600">Length</div>
                    <div>~12 cm</div>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <Weight className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-600">Weight</div>
                    <div>~100g</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Development This Week */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pink-500" />
                  Development This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {developmentMilestones[trimester as keyof typeof developmentMilestones].map((milestone, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mt-1.5"></div>
                      <span className="text-sm text-gray-700">{milestone}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mother" className="space-y-4 mt-4">
            {/* Common Symptoms */}
            <Card>
              <CardHeader>
                <CardTitle>Common Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Fatigue</span>
                      <span className="text-xs text-gray-600">Very Common</span>
                    </div>
                    <Progress value={80} className="h-1" />
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Morning Sickness</span>
                      <span className="text-xs text-gray-600">Common</span>
                    </div>
                    <Progress value={60} className="h-1" />
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Back Pain</span>
                      <span className="text-xs text-gray-600">May Occur</span>
                    </div>
                    <Progress value={40} className="h-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Health Tips for You</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-pink-500 mt-0.5" />
                    <span className="text-sm text-gray-700">Eat small, frequent meals to manage nausea</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-pink-500 mt-0.5" />
                    <span className="text-sm text-gray-700">Stay hydrated - drink at least 8 glasses of water daily</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-pink-500 mt-0.5" />
                    <span className="text-sm text-gray-700">Get plenty of rest and take short naps when needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-pink-500 mt-0.5" />
                    <span className="text-sm text-gray-700">Continue taking your prenatal vitamins</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4 mt-4">
            {/* Vaccination Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  Upcoming Checkups & Vaccinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border-l-4 border-green-500 bg-green-50">
                    <div className="flex-1">
                      <div className="text-sm">Antenatal Visit - Month 6</div>
                      <div className="text-xs text-gray-600">Check baby's growth and position</div>
                    </div>
                    <div className="text-xs text-green-600">Upcoming</div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border-l-4 border-yellow-500 bg-yellow-50">
                    <div className="flex-1">
                      <div className="text-sm">Ultrasound Scan</div>
                      <div className="text-xs text-gray-600">Detailed anatomy scan</div>
                    </div>
                    <div className="text-xs text-yellow-600">In 2 weeks</div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border-l-4 border-gray-300 bg-gray-50">
                    <div className="flex-1">
                      <div className="text-sm">Tetanus Vaccination</div>
                      <div className="text-xs text-gray-600">First dose completed</div>
                    </div>
                    <div className="text-xs text-gray-600">✓ Done</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trimester Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Trimester Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">First Trimester (1-13 weeks)</span>
                      <span className="text-xs text-green-600">✓ Complete</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Second Trimester (14-26 weeks)</span>
                      <span className="text-xs text-blue-600">In Progress</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Third Trimester (27-40 weeks)</span>
                      <span className="text-xs text-gray-400">Not Started</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
