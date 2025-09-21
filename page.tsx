"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, CheckCircle, XCircle, ArrowLeft, Loader2 } from "lucide-react"
import { analyzeAccount, type AnalysisResult } from "@/lib/analysis-service"

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!username) {
      router.push("/")
      return
    }

    // Perform analysis
    const performAnalysis = async () => {
      try {
        const analysisResults = await analyzeAccount(decodeURIComponent(username))
        setResults(analysisResults)
      } catch (error) {
        console.error("Analysis failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    performAnalysis()
  }, [username, router])

  if (!username) {
    router.push("/")
    return null
  }

  if (isLoading || !results) {
    return (
      <div className="min-h-screen bg-background text-foreground dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading results...</p>
        </div>
      </div>
    )
  }

  const totalIssues = results.violations.length + results.warnings.length
  const overallStatus =
    results.violations.length > 0 ? "violations" : results.warnings.length > 0 ? "warnings" : "clean"

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              New Analysis
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Analysis Results</h1>
            <p className="text-xl text-muted-foreground">
              Account: <span className="text-primary font-semibold">@{results.accountUsername}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Analysis completed on {results.analysisDate.toLocaleDateString()}
            </p>
          </div>

          {/* Overall Status */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-4">
                <div
                  className={`p-4 rounded-full ${
                    overallStatus === "violations"
                      ? "bg-destructive/10"
                      : overallStatus === "warnings"
                        ? "bg-yellow-500/10"
                        : "bg-secondary/10"
                  }`}
                >
                  {overallStatus === "violations" ? (
                    <XCircle className="w-12 h-12 text-destructive" />
                  ) : overallStatus === "warnings" ? (
                    <AlertTriangle className="w-12 h-12 text-yellow-500" />
                  ) : (
                    <CheckCircle className="w-12 h-12 text-secondary" />
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    {overallStatus === "violations"
                      ? "Policy Violations Detected"
                      : overallStatus === "warnings"
                        ? "Potential Issues Found"
                        : "Account Appears Clean"}
                  </h2>
                  <p className="text-muted-foreground">
                    {totalIssues > 0
                      ? `${totalIssues} potential issue${totalIssues > 1 ? "s" : ""} identified`
                      : "No significant guideline violations detected"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Violations */}
          {results.violations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-destructive" />
                Policy Violations ({results.violations.length})
              </h3>
              <div className="space-y-4">
                {results.violations.map((violation, index) => (
                  <Alert key={index} className="border-destructive/20 bg-destructive/5">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-destructive">{violation.category}</h4>
                          <div className="flex gap-2">
                            <Badge variant="destructive">{violation.severity} Risk</Badge>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(violation.confidence * 100)}% confidence
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm">{violation.description}</p>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Examples found:</p>
                          <ul className="text-xs space-y-1">
                            {violation.examples.map((example, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-destructive">•</span>
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {results.warnings.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Potential Issues ({results.warnings.length})
              </h3>
              <div className="space-y-4">
                {results.warnings.map((warning, index) => (
                  <Alert key={index} className="border-yellow-500/20 bg-yellow-500/5">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertDescription>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-yellow-600 dark:text-yellow-400">{warning.category}</h4>
                          <div className="flex gap-2">
                            <Badge
                              variant="outline"
                              className="border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
                            >
                              {warning.severity} Risk
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(warning.confidence * 100)}% confidence
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm">{warning.description}</p>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Examples found:</p>
                          <ul className="text-xs space-y-1">
                            {warning.examples.map((example, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-yellow-500">•</span>
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Passed Guidelines */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-secondary" />
              Passed Guidelines ({results.passed.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {results.passed.map((passed, index) => (
                <Card key={index} className="bg-secondary/5 border-secondary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-secondary mt-0.5" />
                      <div>
                        <h4 className="font-medium text-secondary">{passed.category}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{passed.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <Alert className="mb-8">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Disclaimer:</strong> This analysis is based on publicly available content and automated detection
              methods. Results are estimates and should not be considered definitive policy violations. For official
              policy enforcement, please refer to Instagram's community guidelines and reporting mechanisms.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push("/")} variant="outline">
              Analyze Another Account
            </Button>
            <Button onClick={() => window.print()} variant="secondary">
              Export Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
