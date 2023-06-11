USE [AssignRef]
GO

/****** Object:  UserDefinedTableType [dbo].[BatchInsertReplayEntryGrades]    Script Date: 6/11/2023 1:18:10 PM ******/
CREATE TYPE [dbo].[BatchInsertReplayEntryGrades] AS TABLE(
	[ReplayEntryId] [int] NOT NULL,
	[GradeTypeId] [int] NOT NULL,
	[Comment] [nvarchar](1000) NULL
)
GO


