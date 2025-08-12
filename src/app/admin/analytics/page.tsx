
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart2, Eye, ShoppingBag, PieChart, Loader2, AlertCircle, CalendarIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { getProductSalesSummary, getTopSalesByQuantity, type ProductSaleSummary, type TopSaleByQuantity } from '@/services/productService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const chartConfigPurchased = {
  totalQuantitySold: {
    label: "Total Sold",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const chartConfigHighestQuantity = {
  quantitySold: {
    label: "Quantity in Order",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;


export default function AnalyticsPage() {
  const [mostPurchasedData, setMostPurchasedData] = useState<ProductSaleSummary[]>([]);
  const [isLoadingPurchased, setIsLoadingPurchased] = useState(true);
  const [errorPurchased, setErrorPurchased] = useState<string | null>(null);

  const [highestQuantityData, setHighestQuantityData] = useState<TopSaleByQuantity[]>([]);
  const [isLoadingHighestQuantity, setIsLoadingHighestQuantity] = useState(true);
  const [errorHighestQuantity, setErrorHighestQuantity] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      // Fetch Most Purchased Products
      setIsLoadingPurchased(true);
      setErrorPurchased(null);
      try {
        const purchasedData = await getProductSalesSummary(10, startDate, endDate);
        setMostPurchasedData(purchasedData);
      } catch (err) {
        console.error("Error fetching most purchased products:", err);
        setErrorPurchased(err instanceof Error ? err.message : "Failed to load most purchased data.");
      } finally {
        setIsLoadingPurchased(false);
      }

      // Fetch Highest Quantity Per Order
      setIsLoadingHighestQuantity(true);
      setErrorHighestQuantity(null);
      try {
        const highestQtyData = await getTopSalesByQuantity(10, startDate, endDate);
        setHighestQuantityData(highestQtyData);
      } catch (err) {
        console.error("Error fetching highest quantity per order:", err);
        setErrorHighestQuantity(err instanceof Error ? err.message : "Failed to load highest quantity data.");
      } finally {
        setIsLoadingHighestQuantity(false);
      }
    }
    fetchData();
  }, [startDate, endDate]);

  const chartDataPurchased = mostPurchasedData.map(item => ({
    productName: item.productName.length > 15 ? `${item.productName.substring(0, 15)}...` : item.productName,
    totalQuantitySold: item.totalQuantitySold,
  }));

  const chartDataHighestQuantity = highestQuantityData.map((item, index) => ({
    name: `${item.productName.substring(0,12)}${item.productName.length > 12 ? '...' : ''} (Order ${index+1})`,
    quantitySold: item.quantitySold,
    fullProductName: item.productName, // For tooltip
    saleDate: item.saleDate, // For tooltip
  }));

  const handleClearDates = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link href="/admin" passHref legacyBehavior>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Product Analytics</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Filter by Date Range</CardTitle>
          <CardDescription>Select a date range to view sales data for that period. Clear dates to view all-time data.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[280px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) =>
                  (endDate && date > endDate) || date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
           <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[280px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) =>
                  (startDate && date < startDate) || date > new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleClearDates} variant="ghost" className="w-full sm:w-auto">Clear Dates</Button>
        </CardContent>
        {startDate && endDate && startDate > endDate && (
            <CardContent>
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Invalid Date Range</AlertTitle>
                    <AlertDescription>Start date cannot be after end date.</AlertDescription>
                </Alert>
            </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Most Viewed Products Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Most Viewed Products</CardTitle>
            <Eye className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground mb-2">N/A</div>
            <p className="text-xs text-muted-foreground mb-4">
              Tracks which products attract the most user attention. (Requires view tracking implementation).
            </p>
            <div className="mt-4 h-56 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground/70 border border-dashed">
              <PieChart className="h-12 w-12 mr-2 opacity-50" /> Chart Placeholder
            </div>
          </CardContent>
        </Card>

        {/* Most Purchased Products Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Most Purchased Products (by Quantity)</CardTitle>
            <ShoppingBag className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingPurchased ? (
              <div className="mt-4 h-64 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : errorPurchased ? (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorPurchased}</AlertDescription>
              </Alert>
            ) : chartDataPurchased.length === 0 ? (
              <div className="mt-4 h-64 flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
                No sales data available for the selected period.
              </div>
            ) : (
              <div className="mt-4 h-64">
                <ChartContainer config={chartConfigPurchased} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartDataPurchased} margin={{ top: 5, right: 0, left: -20, bottom: 35 }}> {/* Increased bottom margin */}
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="productName" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        angle={-30} // Adjusted angle
                        textAnchor="end"
                        interval={0} 
                        height={60} // Increased height for angled labels
                        style={{ fontSize: '10px' }}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8} 
                        style={{ fontSize: '10px' }}
                        allowDecimals={false}
                      />
                       <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                      <Bar dataKey="totalQuantitySold" fill="var(--color-totalQuantitySold)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products with Highest Quantity Per Order Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Highest Quantity Per Single Order</CardTitle>
            <BarChart2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
             {isLoadingHighestQuantity ? (
              <div className="mt-4 h-64 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : errorHighestQuantity ? (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorHighestQuantity}</AlertDescription>
              </Alert>
            ) : chartDataHighestQuantity.length === 0 ? (
              <div className="mt-4 h-64 flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
                No sales data available for the selected period.
              </div>
            ) : (
              <div className="mt-4 h-64">
                <ChartContainer config={chartConfigHighestQuantity} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartDataHighestQuantity} margin={{ top: 5, right: 0, left: -20, bottom: 35 }}> {/* Increased bottom margin */}
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        angle={-30} // Adjusted angle
                        textAnchor="end"
                        interval={0} 
                        height={60} // Increased height for angled labels
                        style={{ fontSize: '10px' }}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8} 
                        style={{ fontSize: '10px' }}
                        allowDecimals={false}
                      />
                       <ChartTooltip
                          cursor={false}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <ChartTooltipContent
                                  className="text-xs"
                                  label={`${data.fullProductName}`}
                                  items={[
                                    { label: 'Qty in Order', value: data.quantitySold, color: 'hsl(var(--chart-2))' },
                                    { label: 'Sale Date', value: data.saleDate, color: 'hsl(var(--muted-foreground))' },
                                  ]}
                                />
                              );
                            }
                            return null;
                          }}
                        />
                      <Bar dataKey="quantitySold" fill="var(--color-quantitySold)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-6 p-6 bg-secondary/30 rounded-lg shadow">
        <p className="text-lg font-semibold text-primary mb-2">Analytics Under Development</p>
        <p className="text-muted-foreground">
          The "Most Viewed Products" analytics is currently a placeholder.
          Full interactive charts and detailed data for this section will be available in future updates.
        </p>
      </div>
    </div>
  );
}

